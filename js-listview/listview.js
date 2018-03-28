/**

TODO: rtl support

Styling templates:

<style>
.listview[data-listview-orientation="vertical"] > .listview-inner {
	width: 100%;
}
.listview[data-listview-orientation="horizontal"] > .listview-inner {
	height: 100%;
}

.listview > .listview-inner > * {
	padding: 0.5em 1em;
}
.listview[data-listview-orientation="vertical"] > .listview-inner > * {
	border-bottom: #eee 1px solid;
}
.listview[data-listview-orientation="vertical"] > .listview-inner > :last-child {
	border-bottom: none;
}
.listview[data-listview-orientation="horizontal"] > .listview-inner > * {
	border-right: #eee 1px solid;
}
.listview[data-listview-orientation="horizontal"] > .listview-inner > :last-child {
	border-bottom: none;
}
</style>

*/

function ListView(container, adapter, orientation) {
	/**
	 * CustomEvent polyfill
	 * @see https://developer.mozilla.org/ru/docs/Web/API/CustomEvent/CustomEvent
	 */
	var CustomEvent = window.CustomEvent;
	if (typeof CustomEvent !== 'function') {
		CustomEvent = function (event, params) {
			params = params || { bubbles: false, cancelable: false, detail: undefined };
			var evt = document.createEvent('CustomEvent');
			evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
			return evt;
		}
		CustomEvent.prototype = window.Event.prototype;
	}
	
	
	// use default adapter for arrays:
	if (adapter instanceof Array && typeof adapter.getView != 'function') {
		adapter = new ListView.ArrayAdapter(adapter);
	}
	
	if (!(container instanceof HTMLElement)) {
		throw new Error("First argument 'container' should be an HTMLElement");
	}
	var _this = this;
	orientation = orientation || container.getAttribute('data-listview-orientation') || 'vertical';
	var vertical = orientation != 'horizontal';
	orientation = vertical ? 'vertical' : 'horizontal';
	container.classList.add('listview');
	container.style.overflow = 'hidden';
	container.setAttribute('data-listview-orientation', orientation);
	container.setAttribute('data-listview-adapter', adapter.constructor.name);
	Object.defineProperty(this, 'container', {
		enumerable: true,
		configurable: false,
		writable: false,
		value: container
	});
	
	// inner container definition and helpers:
	
	var inner = document.createElement('div');
	inner.style.position = 'relative';
	inner.style.display = 'inline-flex';
	inner.style.flexDirection = vertical ? 'column' : 'row';
	inner.className = 'listview-inner';
	container.appendChild(inner);
	
	inner.getOffsetStart = function () {
		return parseFloat(inner.style[vertical ? 'top' : 'left']) || 0;
	};
	
	inner.setOffsetStart = function (value) {
		inner.style[vertical ? 'top' : 'left'] = value + 'px';
		return value;
	};
	
	inner.incOffsetStart = function (add) {
		return this.setOffsetStart(this.getOffsetStart() + add);
	};
	
	// basics:
	
	this.getStartItemVisibility = function () {
		var v = inner.getOffsetStart();
		var s = getViewSize(inner.children[0]);
		return !inner.children[0] ? null : (!v ? 1 : 1 - (-v / s));
	}
	
	this.getStartIndex = function () {
		return !inner.children.length ? false : +inner.children[0].getAttribute('data-listview-index');
	};
	
	this.getEndIndex = function () {
		return !inner.children.length ? false : +inner.children[inner.children.length - 1].getAttribute('data-listview-index');
	};
	
	this.getOffsetStart = function () {
		return inner.getOffsetStart();
	};
	
	this.getAdapter = function () {
		return adapter;
	};
	
	this.getListItemSize = function (index) {
		return !inner.children[index] ? false : getViewSize(inner.children[index]);
	};
	
	// drawing:
	
	function getView(index, container, inner) {
		var res = adapter.getView(index, container, inner);
		if (res === true || !res)
			return res;
		res.setAttribute('data-listview-index', index);
		inner.dispatchEvent(new CustomEvent('lv-get-view', {
			bubbles: true,
			cancelable: false,
			detail: {
				vertical: vertical,
				orientation: orientation,
				view: res,
			},
		}));
		return res;
	}
	
	function getViewSize(view) {
		return view[vertical ? 'clientHeight' : 'clientWidth'];
	}
	
	this.redraw = function (forceStartIndex) {
		var containerSize = getViewSize(container);
		if (!containerSize) {
			throw new Error("Container size isn't set. Please define " + (vertical ? 'height' : 'width') + " of container");
		}
		var i;
		var clear = false;
		
		if (forceStartIndex === true) {
			i = this.getStartIndex() - 1; // just force redraw existing elements
			clear = true;
		}
		else if (typeof forceStartIndex == 'number') {
			i = forceStartIndex - 1; // scroll to index and redraw
			inner.setOffsetStart(0);
			clear = true;
		}
		else {
			i = this.getEndIndex(); // just add lacking items to the end
		}
		
		if (clear) {
			while (inner.children[0])
				inner.removeChild(inner.children[0]);
		}
		if (i === false)
			i = -1;
		
		// append items:
		var offsetStart = inner.getOffsetStart();
		while (getViewSize(inner) + offsetStart < containerSize) {
			i++;
			var el = getView(i, container, inner);
			if (el === true)
				continue;
			else if (!el) {
				inner.incOffsetStart(getViewSize(container) - getViewSize(inner) - offsetStart);
				break;
			}
			inner.appendChild(el);
		}
		
		// prepend items:
		var i = this.getStartIndex();
		while (inner.getOffsetStart() > 0) {
			i--;
			var el = getView(i, container, inner);
			if (el === true)
				continue;
			else if (!el) {
				inner.setOffsetStart(0);
				break;
			}
			inner.insertBefore(el, inner.children[0]);
			var size = getViewSize(el);
			inner.incOffsetStart(-size);
		}
		
		// remove excessive starting items:
		while (1) {
			offsetStart = inner.getOffsetStart();
			var el = inner.children[0];
			if (!el) {
				inner.setOffsetStart(0);
				break;
			}
			var size = getViewSize(el);
			if (offsetStart + size > 0)
				break;
			inner.incOffsetStart(size);
			inner.removeChild(el);
		}
		
		// remove excessive ending items:
		offsetStart = inner.getOffsetStart();
		while (1) {
			var el = inner.children[inner.children.length - 1];
			if (!el)
				break;
			var size = getViewSize(el);
			if (getViewSize(inner) + offsetStart - size <= getViewSize(container))
				break;
			inner.removeChild(el);
		}
		
		inner.dispatchEvent(new CustomEvent('lv-draw', {
			bubbles: true,
			cancelable: false,
			detail: {
				offsetStart: offsetStart,
				vertical: vertical,
				orientation: orientation,
			},
		}));
	};
	
	// scrolling:
	
	var scrollByAnim = 0;
	function animateScrollBy() {
		var v = scrollByAnim;
		var av = Math.abs(scrollByAnim);
		var sv = scrollByAnim < 0 ? -1 : +1;
		var scrollByStep = av > 1 ? Math.pow(av, 1/1.7)*sv : scrollByAnim;
		inner.incOffsetStart(scrollByStep);
		scrollByAnim -= scrollByStep;
		_this.redraw();
		if (scrollByAnim) {
			dispatchScrollAnimation();
			requestAnimationFrame(animateScrollBy);
		}
		else {
			dispatchScrollStop();
		}
	}
	
	function dispatchScrollStop() {
		inner.dispatchEvent(new CustomEvent('lv-scroll-stop', {
			bubbles: true,
			cancelable: false,
			detail: {
				vertical: vertical,
				orientation: orientation,
			},
		}));
	}
	function dispatchScrollAnimation() {
		inner.dispatchEvent(new CustomEvent('lv-scroll-animation', {
			bubbles: true,
			cancelable: false,
			detail: {
				vertical: vertical,
				orientation: orientation,
				animateScrollBy: animateScrollBy,
			},
		}));
	}
	
	this.scrollBy = function (dOffsetStart, fix, continuous) {
		if (fix) {
			scrollByAnim = 0;
			inner.incOffsetStart(dOffsetStart);
			this.redraw();
			if (!continuous)
				dispatchScrollStop();
			else
				dispatchScrollAnimation();
		}
		else {
			scrollByAnim += dOffsetStart;
			if (scrollByAnim - dOffsetStart == 0)
				animateScrollBy();
		}
		return this;
	};
	
	this.scrollToIndex = function (index) {
		scrollByAnim = 0;
		this.redraw(index);
		dispatchScrollStop();
		return this;
	};
	
	this.scrollSnapStart = function () {
		var offsetStart = this.getOffsetStart();
		if (offsetStart != 0) {
			var itemVisibility = this.getStartItemVisibility();
			// if (itemVisibility < 0.001 || itemVisibility > 0.999)
			// 	return;
			scrollByAnim = 0;
			if (itemVisibility > 0.5) {
				this.scrollBy(-offsetStart);
			}
			else {
				this.scrollBy(-this.getListItemSize(0) - offsetStart);
			}
		}
		return this;
	};
	
	// user interaction:
	
	container.addEventListener('mousewheel', function (event) {
		if (event.ctrlKey || event.shiftKey || event.altKey)
			return;
		_this.scrollBy(-event.deltaY);
		event.preventDefault();
		return false;
	});
	
	var prevPoint = null;
	container.addEventListener('touchstart', function (event) {
		if (event.touches.length == 1) {
			prevPoint = event.touches[0];
			prevPoint.dps = [];
			_this.scrollBy(0, true);
		}
		else {
			prevPoint = null;
		}
	});
	
	container.addEventListener('touchmove', function (event) {
		if (event.touches.length != 1) {
			return;
		}
		var point = event.touches[0];
		point.dps = prevPoint.dps;
		var dp = vertical ? point.pageY - prevPoint.pageY : point.pageX - prevPoint.pageX;
		point.dps.push([event.timeStamp, dp]);
		if (point.dps.length > 10)
			point.dps.shift();
		if (dp)
			_this.scrollBy(dp, true, true);
		prevPoint = point;
		event.preventDefault();
		return false;
	});
	
	document.body.addEventListener('touchend', function (event) {
		if (prevPoint && prevPoint.dps.length && event.changedTouches.length == 1) {
			var point = event.changedTouches[0];
			point.timeStamp = event.timeStamp;
			var dpc = 0;
			var dp = prevPoint.dps.reduce(function (a, b) {
				if (b[1] == 0) {
					dpc = 0;
					return 0;
				}
				else if (point.timeStamp - b[0] > 50)
					return a;
				else {
					dpc++;
					return a + b[1];
				}
			}, 0);
			if (dpc > 0) {
				var dir = dp < 0 ? -1 : +1;
				var offset = Math.pow(Math.abs(dp) / dpc, 1.2);
				_this.scrollBy(dir * offset * (getViewSize(container) / 50));
			}
			else {
				_this.scrollBy(0, true, false);
			}
		}
		prevPoint = null;
	});
	
	container.addEventListener('keydown', function (event) {
		if (event.altKey || event.ctrlKey || event.shiftKey)
			return;
		
		var up = 38;
		var down = 40;
		var left = 37;
		var right = 39;
		var pgup = 33;
		var pgdn = 34;
		var key = event.keyCode || event.which;
		var containerSize = getViewSize(container);
		
		if ((vertical && key == up) || (!vertical && key == left)) {
			_this.scrollBy(+containerSize / 10);
		}
		else if ((vertical && key == down) || (!vertical && key == right)) {
			_this.scrollBy(-containerSize / 10);
		}
		else if (key == pgup) {
			_this.scrollBy(+containerSize);
		}
		else if (key == pgdn) {
			_this.scrollBy(-containerSize);
		}
		else {
			return;
		}
		event.preventDefault();
		return false;
	});
	
	this.redraw();
}

ListView.ArrayAdapter = function (items) {
	this.getView = function (index, container, inner) {
		if (index < 0 || index >= items.length)
			return null;
		var view = document.createElement('div');
		view.textContent = items[index];
		return view;
	};
};

ListView.PrimesAdapter = function () {
	function isPrime(n) {
		if (n < 2)
			return false;
		if (n != 2 && n % 2 == 0)
			return false;
		for (var i = Math.sqrt(n) | 0; i > 1; i--) {
			if (n % i == 0)
				return false;
		}
		return true;
	}
	
	this.getView = function (i) {
		if (i < 0)
			return false; // do not show and stop
		else if (!isPrime(i))
			return true; // do not show and continue
		
		var res = document.createElement('div');
		res.textContent = i;
		return res; // show view if the i is prime
	};
};
