Function.prototype.once = function once(period, context, args) {
	var now = (new Date()).getTime();
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
			},
		});
	}
	var once = this.__once__;
	once.context = context;
	once.args = Array.prototype.slice.call(arguments, 2);
	if (!once.timeout || once.period <= 0 || once.period > period) {
		once.period = period;
		once.promise = new Promise(function (resolve) {
			once.timeout && clearTimeout(once.timeout);
			once.timeout = setTimeout(function () {
				once.timeout = null;
				resolve(once.fn.apply(once.context, once.args));
			}, once.period);
		});
		once.time = now;
	}
	
	return once.promise;
};
