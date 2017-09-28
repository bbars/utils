Function.prototype.once = function once(period, context, args) {
	var now = (new Date()).getTime();
	if (typeof this != 'function')
		throw new Error('Function.once() should be called within a function scope');
	if (!this.__once__) {
		Object.defineProperty(this, '__once__', {
			value: {
				fn: this,
				time: -1,
				context: null,
				args: null,
				timeout: null,
				period: -1,
				promise: null,
				abort: false,
				abortReason: null,
			},
		});
	}
	var once = this.__once__;
	once.context = context;
	once.args = Array.prototype.slice.call(arguments, 2);
	if (!once.timeout || period < once.period || once.period <= 0) {
		once.period = period;
		once.promise = new Promise(function (resolve, reject) {
			once.timeout && clearTimeout(once.timeout);
			once.timeout = setTimeout(function () {
				once.timeout = null;
				if (!once.abort) {
					try {
						resolve(once.fn.apply(once.context, once.args));
					}
					catch (e) {
						reject(e);
					}
				}
				else if (once.abortReason)
					reject(once.abortReason);
			}, once.period);
		});
		once.time = now;
	}
	
	return once.promise;
};

Function.prototype.abort = function abort(reason) {
	if (!this.__once__ || !this.__once__.timeout)
		return false;
	this.__once__.abort = true;
	this.__once__.abortReason = reason;
	return true;
};