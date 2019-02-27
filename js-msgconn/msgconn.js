function MsgConn(dstWindow) {
	this._dstWindow = dstWindow;
	this._callbacks = {};
	this._acks = {};
	
	this._processMessage = this.constructor.prototype._processMessage.bind(this);
	window.addEventListener('message', this._processMessage, false);
}

MsgConn.prototype._processMessage = function (event) {
	if (!(event.data instanceof Array)) {
		return;
	}
	var type = event.data[0];
	if (type === MsgConn.Types.BEACON) {
		var args = event.data[1];
		var eventName = args.shift();
		if (!this._callbacks[eventName]) {
			console.warn("Unknown event name", eventName, args);
			return;
		}
		for (var i = 0; i < this._callbacks[eventName].length; i++) {
			this._callbacks[eventName][i].apply(null, args);
		}
		return false;
	}
	else if (type === MsgConn.Types.QUERY) {
		var seq = event.data[1];
		var args = event.data[2];
		var eventName = args.shift();
		if (!this._callbacks[eventName]) {
			// console.warn("Unknown event name", eventName, args);
			MsgConn.invokeFunction(event.source, function () {
				throw new Error("Unknown event name " + eventName);
			}, seq, []);
			return;
		}
		for (var i = 0; i < this._callbacks[eventName].length; i++) {
			MsgConn.invokeFunction(event.source, this._callbacks[eventName][i], seq, args);
		}
		return false;
	}
	else if (type === MsgConn.Types.ACK) {
		var seq = event.data[1];
		var success = event.data[2];
		var args = event.data[3];
		if (!this._acks[seq]) {
			console.warn("Unknown ack", seq);
			return;
		}
		var ack = this._acks[seq];
		delete this._acks[seq];
		ack[success ? 0 : 1].apply(null, args);
		return false;
	}
	else {
		console.warn("Unknown message type", type);
	}
};

MsgConn.prototype.close = function () {
	window.removeEventListener('message', this._processMessage, false);
	this._dstWindow = null;
};

MsgConn.prototype.on = function (eventName, callback) {
	if (typeof callback !== 'function') {
		throw new Error("Callback is not a function");
	}
	if (!this._callbacks[eventName]) {
		this._callbacks[eventName] = [];
	}
	this._callbacks[eventName].push(callback);
	return this;
};

MsgConn.prototype.off = function (eventName, callback) {
	if (this._callbacks[eventName]) {
		return this;
	}
	if (!callback) {
		delete this._callbacks[eventName];
	}
	else {
		var a = this._callbacks[eventName];
		while ((i = a.indexOf(callback)) > -1) {
			a.splice(i, 1);
		}
	}
	return this;
};

MsgConn.prototype._sendRawMessage = function (message) {
	if (!this._dstWindow) {
		throw new Error("Closed output");
	}
	if (message === undefined) {
		return true;
	}
	return MsgConn.sendRawMessage(this._dstWindow, message);
};

MsgConn.prototype.beacon = function (eventName, argN) {
	this._sendRawMessage([MsgConn.Types.BEACON, Array.prototype.slice.call(arguments, 0)]);
};

MsgConn.prototype.query = function (eventName, argN) {
	this._sendRawMessage(); // output check
	var _this = this;
	var args = Array.prototype.slice.call(arguments, 0);
	return new Promise(function (resolve, reject) {
		var sec = MsgConn.generateSeq();
		_this._acks[sec] = [resolve, reject];
		_this._sendRawMessage([MsgConn.Types.QUERY, sec, args]);
	});
};

MsgConn.prototype.emit = function (eventName, argN, callback) {
	var args = Array.prototype.slice.call(arguments, 0);
	callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
	if (!callback) {
		this.beacon.apply(this, args);
	}
	else {
		this.query.apply(this, args).then(callback, console.warn);
	}
	return this;
};

MsgConn.Types = {
	// PING: 1,
	// PONG: 2,
	BEACON: 3,
	QUERY: 4,
	ACK: 5,
};

MsgConn.invokeFunction = function invokeFunction(wnd, fn, seq, args) {
	return new Promise(function (resolve, reject) {
			try {
				resolve(fn.apply(null, args));
			}
			catch (err) {
				reject(err);
			}
		})
		.then(function (res) {
			MsgConn.sendRawMessage(wnd, [MsgConn.Types.ACK, seq, true, [res]]);
		})
		.catch(function (err) {
			if (err === null) {}
			else {
				err = err instanceof Error ? err.message : (err + '');
			}
			MsgConn.sendRawMessage(wnd, [MsgConn.Types.ACK, seq, false, [err]]);
		})
	;
};

MsgConn.sendRawMessage = function sendRawMessage(dst, msg) {
	return dst.postMessage(msg, '*');
};

MsgConn.generateSeq = function generateSeq() {
	return Math.abs((Math.random() * 0xffffffff) | 0).toString(32)
		+ (Date.now ? Date.now() : new Date().getTime()).toString(32);
};

////////////////////

function RPCConn(dstWindow) {
	MsgConn.apply(this, Array.prototype.slice.call(arguments, 0));
}

RPCConn.prototype = Object.create(MsgConn.prototype);
RPCConn.prototype.constructor = RPCConn;

RPCConn.prototype.exportFunction = function (func, funcName) {
	if (typeof func != 'function') {
		throw new Error("First argument 'func' should be a function");
	}
	funcName = funcName || func.name;
	if (!funcName) {
		throw new Error("Exported function must have a name");
	}
	this.on(funcName, func);
};

RPCConn.prototype.applyFunction = function (funcName, args) {
	return this.query.apply(this, Array.prototype.slice.call(args, 0));
};

RPCConn.prototype.callFunction = function (funcName, argN) {
	return this.applyFunction(funcName, Array.prototype.slice.call(arguments, 0));
};

RPCConn.prototype.linkFunction = function (funcName) {
	return this.callFunction.bind(this, funcName);
};
