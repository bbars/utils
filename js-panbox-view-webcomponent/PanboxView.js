const tplBase = document.createElement('template');
tplBase.innerHTML = `
	<style>
	
	:host {
		display: inline-block;
		width: 350px;
		height: 200px;
		overflow: auto;
	}
	:host #elWrapper {
		position: relative;
		width: 100%;
		height: 100%;
	}
	:host #elContainer {
		width: 100%;
		height: 100%;
		transform-origin: 0 0;
		transform: scale(1);
	}
	
	</style>
	<div id="elWrapper">
		<div id="elContainer">
			<slot></slot>
		</div>
	</div>
`;

function dispatchEvent(element, eventType, detail) {
	const event = new CustomEvent(eventType, {
		detail: detail,
		bubbles: true,
	});
	element.dispatchEvent(event);
	return event;
}

export default class PanboxView extends HTMLElement {
	disabled = false;
	_ignoreAttributeChanges = 0;
	
	static get observedAttributes() {
		return [
			'disabled',
			'min-scale',
			'max-scale',
		];
	}
	
	static get boolAttributes() {
		return ['disabled'];
	}
	
	attributeChangedCallback(name, oldValue, newValue) {
		if (this._ignoreAttributeChanges) {
			return;
		}
		if (this.constructor.observedAttributes.indexOf(name) > -1) {
			if (this.constructor.boolAttributes.indexOf(name) > -1) {
				newValue = newValue != null;
			}
			name = name.replace(/([a-z])-([a-z])/g, (m0, m1, m2) => {
				return m1 + m2.toUpperCase();
			});
			this[name] = newValue;
		}
	}
	
	_linkAttributeGet(name) {
		if (this.constructor.boolAttributes.indexOf(name) > -1) {
			return this.hasAttribute(name);
		}
		else {
			return this.getAttribute(name);
		}
	}
	
	_linkAttributeSet(name, value) {
		try {
			this._ignoreAttributeChanges++;
			if (this.constructor.boolAttributes.indexOf(name) > -1) {
				value = !!value;
				if (this.hasAttribute(name) === value) {
					return false;
				}
				if (value) {
					this.setAttribute(name, '');
				}
				else {
					this.removeAttribute(name);
				}
			}
			else {
				value = '' + value;
				if (this.getAttribute(name) === value) {
					return false;
				}
				this.setAttribute(name, value);
			}
			return true;
		}
		finally {
			this._ignoreAttributeChanges--;
		}
	}
	
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.appendChild(tplBase.content.cloneNode(true));
		
		this.shadowRoot.querySelectorAll('[id]').forEach((el) => {
			this.shadowRoot[el.id] = el;
		});
		// this.shadowRoot.elWrapper = this.shadowRoot.getElementById('elWrapper');
		// this.shadowRoot.elContainer = this.shadowRoot.getElementById('elContainer');
		this.scaleRel = 0;
		this.minScale = 1;
		this.maxScale = 3;
		
		this.$$onMouseWheel = this.$$onMouseWheel.bind(this);
		this.$$onTouchStart = this.$$onTouchStart.bind(this);
		this.$$onTouchMove = this.$$onTouchMove.bind(this);
		this.$$onTouchEnd = this.$$onTouchEnd.bind(this);
		this.$$onScroll = this.$$onScroll.bind(this);
	}
	
	connectedCallback() {
		this.shadowRoot.elWrapper.addEventListener('mousewheel', this.$$onMouseWheel);
		this.addEventListener('touchstart', this.$$onTouchStart);
		this.shadowRoot.elWrapper.addEventListener('touchmove', this.$$onTouchMove, true);
		window.addEventListener('touchend', this.$$onTouchEnd);
		this.addEventListener('scroll', this.$$onScroll);
	}
	
	disconnectedCallback() {
		this.shadowRoot.elWrapper.removeEventListener('mousewheel', this.$$onMouseWheel);
		this.removeEventListener('touchstart', this.$$onTouchStart);
		this.shadowRoot.elWrapper.removeEventListener('touchmove', this.$$onTouchMove);
		window.removeEventListener('touchend', this.$$onTouchEnd);
		this.removeEventListener('scroll', this.$$onScroll);
	}
	
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	
	get disabled() {
		return this._linkAttributeGet('disabled');
	}
	set disabled(value) {
		this._linkAttributeSet('disabled', value);
	}
	
	get minScale() {
		return this._minScale;
	}
	set minScale(value) {
		this._minScale = +value;
	}
	
	get maxScale() {
		return this._maxScale;
	}
	set maxScale(value) {
		this._maxScale = +value;
	}
	
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	/////////////////////////////////////////////
	
	_scrollLeft = 0;
	_scrollTop = 0;
	_ignoreScroll = false;
	_scrolling = false;
	
	getViewbox() {
		return {
			x: this._scrollLeft / this.scale,
			y: this._scrollTop / this.scale,
			w: this.clientWidth / this.scale,
			h: this.clientHeight / this.scale,
		};
	}
	
	setViewbox(x, y, w, h) {
		if (typeof x === 'object') {
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		const setScale = Math.max(this.clientWidth / w, this.clientHeight / h);
		this.scale = setScale;
		this._ignoreScroll = true;
		this.scrollLeft = this._scrollLeft = x * this.scale;
		this.scrollTop = this._scrollTop = y * this.scale;
		this._ignoreScroll = false;
	}
	
	get scale() {
		// const value = this.shadowRoot.elContainer.style.zoom;
		const value = this._scale;
		return value === undefined || value === '' ? 1 : +value;
	}
	set scale(value) {
		value = Math.max(this.minScale, Math.min(value, this.maxScale));
		this._scale = value;
		return this.shadowRoot.elContainer.style.transform = `scale(${value})`;
	}
	
	_processTouches(touch1, touch2) {
		const x1 = touch1.clientX - this.offsetLeft;
		const y1 = touch1.clientY - this.offsetTop;
		const x2 = touch2.clientX - this.offsetLeft;
		const y2 = touch2.clientY - this.offsetTop;
		return {
			cx: (x1 + x2) / 2,
			cy: (y1 + y2) / 2,
			d: Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)),
		};
	}
	
	$$onScroll(event) {
		if (this._ignoreScroll) {
			return;
		}
		this._scrollLeft = this.scrollLeft;
		this._scrollTop = this.scrollTop;
		if (this.$$onTouchStart._touchLength) {
			this._scrolling = true;
		}
	}
	
	$$onMouseWheel(event) {
		if (!event.ctrlKey) {
			return;
		}
		event.preventDefault();
		
		const prevBox = this.getViewbox();
		const x = (event.clientX - this.offsetLeft) / this.clientWidth;
		const y = (event.clientY - this.offsetTop) / this.clientHeight;
		
		let scaleRel = this.scaleRel;
		if (!scaleRel) {
			scaleRel = 1 + Math.abs(event.deltaY) / (screen.availHeight || screen.height);
		}
		scaleRel = event.deltaY < 0 ? scaleRel : (1 / scaleRel);
		let setScale = this.scale * scaleRel;
		if ((this.scale < 1 && setScale > 1) || (this.scale > 1 && setScale < 1)) {
			setScale = 1;
		}
		setScale = Math.max(this.minScale, Math.min(setScale, this.maxScale));
		scaleRel = setScale / this.scale;
		const w = prevBox.w / scaleRel;
		const h = prevBox.h / scaleRel;
		
		const curBox = {
			w: w,
			h: h,
			x: prevBox.x + (prevBox.w - w) * x,
			y: prevBox.y + (prevBox.h - h) * y,
		};
		this.setViewbox(curBox);
	}
	
	$$onTouchStart(event) {
		this.$$onTouchStart._touchLength = null;
		this.$$onTouchStart._touchMoves = this.$$onTouchStart._touchMoves || 0;
		if (event.touches.length === 2) {
			this.$$onTouchStart._cap = this._processTouches(event.touches[0], event.touches[1]);
			event.preventDefault();
		}
	}
	
	$$onTouchEnd(event) {
		this.$$onTouchStart._touchLength = event.touches.length;
		this.$$onTouchStart._cap = null;
		if (event.touches.length === 0) {
			this._scrolling = false;
			this.$$onTouchStart._touchMoves = 0;
		}
	}
	
	$$onTouchMove(event) {
		if (this._scrolling || this.$$onTouchStart._touchMoves < 4) {
			event.stopPropagation();
		}
		this.$$onTouchStart._touchMoves++;
		this.$$onTouchStart._touchLength = event.touches.length;
		if (!this.$$onTouchStart._cap) {
			// event.preventDefault();
			return;
		}
		event.preventDefault();
		
		const prevCap = this.$$onTouchStart._cap;
		const cap = this._processTouches(event.touches[0], event.touches[1]);
		this.$$onTouchStart._cap = cap;
		const vbox = this.getViewbox();
		
		let rx = cap.cx / this.clientWidth;
		let ry = cap.cy / this.clientHeight;
		
		let dx = (prevCap.cx - cap.cx) / this.scale;
		let dy = (prevCap.cy - cap.cy) / this.scale;
		vbox.x += dx;
		vbox.y += dy;
		
		let scaleRel = cap.d / prevCap.d;
		let setScale = this.scale * scaleRel;
		setScale = Math.max(this.minScale, Math.min(setScale, this.maxScale));
		scaleRel = setScale / this.scale;
		
		let dw = vbox.w - (vbox.w * scaleRel);
		let dh = vbox.h - (vbox.h * scaleRel);
		vbox.w += dw;
		vbox.h += dh;
		
		vbox.x -= rx * dw;
		vbox.y -= ry * dh;
		
		this.setViewbox(vbox);
	}
}

window.customElements.define('panbox-view', PanboxView);
