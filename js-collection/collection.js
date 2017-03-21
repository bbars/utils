function Collection(items, parent) {
	if (items && items.length > 0) {
		for (var i = 0; i < items.length; i++)
			this.push(items[i]);
	}
	
	Object.defineProperty(this, 'parent', {
		enumerable: false,
		writable: false,
		value: parent === false ? parent : parent || null,
	});
}

Collection.prototype = Object.create(Array.prototype);
Collection.prototype.constructor = Collection;

Collection.prototype.filter = function (expr) {
	if (typeof expr != 'function') {
		expr = Collection.getComparisonFn(expr);
	}
	return new this.constructor(Array.prototype.filter.call(this, expr), this.parent !== false ? this : false);
};

Collection.prototype.call = function (fn) {
	var args = Array.prototype.slice.call(arguments, 1);
	return this.map(function (item) {
		return (typeof fn != 'function' ? item[fn] : fn).apply(item, args);
	});
};

Collection.prototype.apply = function (fn, args) {
	return this.map(function (item) {
		return (typeof fn != 'function' ? item[fn] : fn).apply(item, args);
	});
};

Collection.prototype.get = function (property) {
	return this.map(function (item) {
		return item[property];
	});
};

Collection.prototype.set = function (property, value) {
	this.map(function (item) {
		item[property] = value;
	});
	return this;
};

Collection.getComparisonFn = function (expr) {
	if (expr instanceof Array) {
		var fns = [];
		for (var i = 0; i < expr.length; i++) {
			fns = fns.concat(Collection.getComparisonFn(expr[i]));
		}
		return function (item) {
			for (var i = 0; i < fns.length; i++) {
				if (fns[i](item))
					return true;
			}
			return false;
		};
	}
	
	var key, operator, value;
	var m = /^([^!=><*]*)(\*=|!=|[=><]=?)(.*)/.exec(expr);
	if (m) {
		key = m[1];
		operator = m[2];
		value = m[3];
	}
	
	switch (operator) {
		case '!=': return function (item) { return item[key] != value; };
		case '==':
		case '=':  return function (item) { return item[key] == value; };
		case '>':  return function (item) { return item[key] >  value; };
		case '>=': return function (item) { return item[key] >= value; };
		case '<':  return function (item) { return item[key] <  value; };
		case '<=': return function (item) { return item[key] <= value; };
		case '*=': {
			var re = /^\/(.*)\/([igm]*)$/.exec(value) || ['', value, '']
			re = new RegExp(re[1], re[2]);
			return function (item) { return re.test(item[key]); };
		}
	}
	throw "Invalid expression '" + expr + "'";
};
