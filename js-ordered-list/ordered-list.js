function OrderedList(cmp) {
	Object.defineProperties(this, {
		cmp: {
			get: function () {
				return cmp
			},
		},
		sort: {
			value: function (newCmp) {
				cmp = newCmp || OrderedList.defaultComparator;
				Array.prototype.sort.call(this, cmp);
				return this;
			},
		},
		push: {
			value: this.add,
		},
		unshift: {
			value: this.add,
		},
	});
	
	this.sort(cmp);
}

OrderedList.prototype = Object.create(Array.prototype);
OrderedList.prototype.constructor = OrderedList;

OrderedList.defaultComparator = function (a, b) {
	if (a == b)
		return 0;
	return a > b ? 1 : -1;
};

OrderedList.prototype.add = function (value) {
	var i = this.findClosestIndex(value) + 1;
	Array.prototype.splice.call(this, i, 0, value);
	return i;
};

OrderedList.prototype.findClosestIndex = function (value) {
	if (!this.length)
		return -1;
	var l = 0;
	var r = this.length;
	var i;
	var c;
	
	do {
		i = l + (r - l) / 2 | 0;
		c = this.cmp(this[i], value);
		
		if (c > 0) {
			if (r == i)
				break;
			r = i;
		}
		else if (c < 0) {
			if (l == i)
				break;
			l = i;
		}
		else //if (c == 0)
			break;
	} while (r - l > 0);
	
	if (this.cmp(this[i], value) > 0) {
		i--;
	}
	
	return i;
};
