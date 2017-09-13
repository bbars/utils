function LoopedArray(length) {
	var cursor = 0;
	this.length = length || 0;
	
	Object.defineProperties(this, {
		cursor: {
			get: function () {
				return cursor;
			},
		},
		push: {
			value: function (value) {
				if (!this.length)
					throw new Error("Buffer underflow");
				return this[cursor++ % this.length] = value;
			},
		},
		unshift: {
			value: function (value) {
				if (!this.length)
					throw new Error("Buffer underflow");
				cursor--;
				if (cursor < 0)
					cursor += this.length;
				return this[cursor % this.length] = value;
			},
		},
	});
}

LoopedArray.prototype = Object.create(Array.prototype);
LoopedArray.prototype.constructor = LoopedArray;

LoopedArray.prototype.getIterator = function () {
	var cursor = this.cursor;
	var index = -1;
	var _this = this;
	
	return {
		next: function () {
			if (index == _this.length - 1)
				return null;
			index++;
			return {
				index: index,
				cursor: cursor,
				position: cursor % _this.length,
				value: _this[cursor++ % _this.length],
			};
		},
	};
};

LoopedArray.prototype.toArray = function () {
	var position = this.cursor % this.length;
	return this.slice(position).concat(this.slice(0, position));
};
