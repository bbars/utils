(function () {
	const tplBase = document.createElement('template');
	tplBase.innerHTML = `
		<style>
		:host {
			all: initial;
			display: inline-block;
			width: auto;
			height: 100px;
			user-select: none;
		}
		:host([disabled]) {
			filter: contrast(0.75);
		}
		:host #elKeys {
			display: inline-flex;
			vertical-align: bottom;
			width: 100%;
			height: 100%;
		}
		
		:host #elKeys > * {
			position: relative;
			z-index: 1;
			flex: 1 1 1em;
			width: 1em;
			height: 100%;
			box-sizing: border-box;
			border: 1px outset;
			border-bottom-left-radius:  0.15em;
			border-bottom-right-radius: 0.15em;
			background: #f9f9f9;
			background: linear-gradient(to bottom, #f3f3f3 0%,#fefefe 100%);
		}
		:host #elKeys > .black {
			z-index: 2;
			flex: 0 0 0.7em;
			width: 0.7em;
			height: 65% !important;
			margin: 0 -0.35em;
			border: none;
			left: -1px;
			
			border-radius: 0.15em;
			border-bottom-left-radius:  20% 50%;
			border-bottom-right-radius: 20% 50%;
			background: #444;
			background: linear-gradient(to bottom, #555 0%,#444 100%);
			box-shadow: #fff7 +0.1em +0.1em 0px 0 inset, #0003 -0.1em -0.2em 0px 0 inset;
		}
		
		:host #elKeys > * {
			transition: all 0.08s ease;
		}
		:host #elKeys > .active {
			background: #f0f0f0;
			background: linear-gradient(to bottom, #f3f3f3 0%, #ddd 100%);
			height: 98%;
			box-shadow: rgba(0,0,0, 0.25) 0px 1px 1px -1px;
		}
		:host #elKeys > .black.active {
			background: #333;
			background: linear-gradient(to bottom, #555 0%,#333 100%);
			height: 63% !important;
			box-shadow: #fff7 +0.1em +0.1em 0px 0 inset, #0003 -0.1em -0.2em 0px 0 inset;
		}
		:host #elKeys > :first-child {
			border-top-left-radius:  0.15em;
			margin-left: 0;
		}
		:host #elKeys > :last-child {
			border-top-right-radius: 0.15em;
			margin-right: 0;
		}
		
		/* vertical overrides: */
		:host([vertical]) {
			width: 100px;
			height: auto;
		}
		:host([vertical]) #elKeys {
			flex-direction: column-reverse;
		}
		:host([vertical]) #elKeys > * {
			height: 1em;
			width: 100%;
			border: 1px outset;
			border-bottom-left-radius:  0;
			border-top-right-radius:    0.15em;
			border-bottom-right-radius: 0.15em;
			background: #f9f9f9;
			background: linear-gradient(to right, #f3f3f3 0%,#fefefe 100%);
		}
		:host([vertical]) #elKeys > :last-child {
			border-top: 1px outset;
		}
		:host([vertical]) #elKeys > .black {
			width: 65% !important;
			height: 0.7em !important;
			flex: 0 0 0.7em;
			margin: -0.35em 0;
			
			border: none;
			left: 0;
			top: -1px;
			
			border-radius: 0.15em;
			border-top-right-radius:    50% 20%;
			border-bottom-right-radius: 50% 20%;
			background: #444;
			background: linear-gradient(to right, #555 0%,#444 100%);
			box-shadow: #fff7 +0.1em +0.1em 0px 0 inset, #0003 -0.1em -0.2em 0px 0 inset; /*!!!*/
		}
		:host([vertical]) #elKeys > .active {
			background: #f0f0f0;
			background: linear-gradient(to right, #f3f3f3 0%, #ddd 100%);
			width: 98%;
			box-shadow: rgba(0,0,0, 0.25) 0px 1px 1px -1px; /*!!!*/
		}
		:host([vertical]) #elKeys > .black.active {
			background: #333;
			background: linear-gradient(to right, #555 0%,#333 100%);
			width: 63% !important;
			box-shadow: #fff7 +0.1em +0.1em 0px 0 inset, #0003 -0.1em -0.2em 0px 0 inset; /*!!!*/
		}
		:host([vertical]) #elKeys > :first-child {
			border-bottom-left-radius:  0.15em;
			margin-bottom: 0;
		}
		:host([vertical]) #elKeys > :last-child {
			border-top-left-radius: 0.15em;
			margin-top: 0;
		}
		</style>
		<div id="elKeys"></div>
	`;
	const tplKey = document.createElement('span');
	
	function isNoteBlack(note) {
		note = note % 12;
		return (note === 1)
			|| (note === 3)
			|| (note === 5)
			|| (note === 8)
			|| (note === 10);
	}
	
	function dispatchEvent(element, eventType, detail) {
		element.dispatchEvent(new CustomEvent(eventType, {
			detail: detail,
			bubbles: true,
		}));
	}
	
	function createOnMouseDownListener(midiKbdElement) {
		return function (event) {
			var elKeys = midiKbdElement.shadowRoot.getElementById('elKeys');
			if (midiKbdElement.disabled || event.target.parentElement !== elKeys || event.target.classList.contains('active'))
				return;
			midiKbdElement.cap = true;
			midiKbdElement.playNote(event.target.note);
		};
	}
	function createOnMouseUpListener(midiKbdElement) {
		return function (event) {
			midiKbdElement.cap = false;
			midiKbdElement.stopAllNotes();
		};
	}
	function onMouseEnter(event) {
		var midiKbdElement = event.target._midiKbdElement;
		if (!midiKbdElement.cap)
			return;
		midiKbdElement.playNote(event.target.note);
	}
	function onMouseLeave(event) {
		var midiKbdElement = event.target._midiKbdElement;
		if (!midiKbdElement.cap)
			return;
		midiKbdElement.stopNote(event.target.note);
	}
	
	class HTMLMidiKbdElement extends HTMLElement {
		static get observedAttributes() {
			return ['min', 'max', 'disabled', 'vertical'];
		}
		
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			this.shadowRoot.appendChild(tplBase.content.cloneNode(true));
			this.shadowRoot._noteKeyMap = {};
		}
		
		connectedCallback() {
			var elKeys = this.shadowRoot.getElementById('elKeys');
			this.min = this.getAttribute('min') || 0;
			this.max = this.getAttribute('max') || 0;
			this.disabled = this.getAttribute('disabled') || 0;
			this.cap = false;
			this.shadowRoot.onMouseDown = createOnMouseDownListener(this);
			this.shadowRoot.onMouseUp = createOnMouseUpListener(this);
			elKeys.addEventListener('mousedown', this.shadowRoot.onMouseDown);
			window.addEventListener('mouseup', this.shadowRoot.onMouseUp);
		}
		disconnectedCallback() {
			var elKeys = this.shadowRoot.getElementById('elKeys');
			elKeys.removeEventListener('mousedown', this.shadowRoot.onMouseDown);
			window.removeEventListener('mouseup', this.shadowRoot.onMouseUp);
		}
		
		get min() {
			var elKeys = this.shadowRoot.getElementById('elKeys');
			return elKeys.children[0] ? elKeys.children[0].note : 0;
		}
		set min(value) {
			value = parseInt(value) || 0;
			this.setAttribute('min', value);
			var elKeys = this.shadowRoot.getElementById('elKeys');
			var elKey;
			while (elKeys.children[0] && elKeys.children[0].note < value) {
				elKey = elKeys.children[0];
				this.stopNote(elKey.note);
				delete this.shadowRoot._noteKeyMap[elKey.note];
				elKeys.removeChild(elKey);
			}
			while (!elKeys.children[0] || elKeys.children[0].note > value) {
				elKey = tplKey.cloneNode(true);
				elKey.note = elKeys.children[0] ? elKeys.children[0].note - 1 : value;
				this.shadowRoot._noteKeyMap[elKey.note] = elKey;
				elKey.classList.toggle('black', isNoteBlack(elKey.note));
				elKey._midiKbdElement = this;
				elKey.addEventListener('mouseenter', onMouseEnter);
				elKey.addEventListener('mouseleave', onMouseLeave);
				elKeys.insertBefore(elKey, elKeys.children[0]);
			}
		}
		
		get max() {
			var elKeys = this.shadowRoot.getElementById('elKeys');
			return elKeys.children[elKeys.children.length-1] ? elKeys.children[elKeys.children.length-1].note : 0;
		}
		set max(value) {
			value = parseInt(value) || 0;
			this.setAttribute('max', value);
			var elKeys = this.shadowRoot.getElementById('elKeys');
			var elKey;
			while (elKeys.children[elKeys.children.length-1] && elKeys.children[elKeys.children.length-1].note > value) {
				elKey = elKeys.children[elKeys.children.length-1];
				this.stopNote(elKey.note);
				delete this.shadowRoot._noteKeyMap[elKey.note];
				elKeys.removeChild(elKey);
			}
			while (!elKeys.children[elKeys.children.length-1] || elKeys.children[elKeys.children.length-1].note < value) {
				elKey = tplKey.cloneNode(true);
				elKey.note = elKeys.children[elKeys.children.length-1] ? elKeys.children[elKeys.children.length-1].note + 1 : value;
				this.shadowRoot._noteKeyMap[elKey.note] = elKey;
				elKey.classList.toggle('black', isNoteBlack(elKey.note));
				elKey._midiKbdElement = this;
				elKey.addEventListener('mouseenter', onMouseEnter);
				elKey.addEventListener('mouseleave', onMouseLeave);
				elKeys.appendChild(elKey);
			}
		}
		
		get disabled() {
			return this.hasAttribute('disabled');
		}
		set disabled(value) {
			value = !!value;
			if (!value)
				this.removeAttribute('disabled');
			else {
				this.cap = false;
				this.stopAllNotes();
				this.setAttribute('disabled', '');
			}
		}
		
		get vertical() {
			return this.hasAttribute('vertical');
		}
		set vertical(value) {
			value = !!value;
			if (!value)
				this.removeAttribute('vertical');
			else {
				this.setAttribute('vertical', '');
			}
		}
		
		attributeChangedCallback(name, oldValue, newValue) {
			if (oldValue === newValue) {
				return;
			}
			else if (name == 'min') {
				this.min = newValue;
			}
			else if (name == 'max') {
				this.max = newValue;
			}
		}
		
		playNote(note) {
			var elKey = this.shadowRoot._noteKeyMap[note];
			if (!elKey || elKey.classList.contains('active')) {
				return false;
			}
			elKey.classList.add('active');
			dispatchEvent(this, 'playnote', {note: elKey.note});
			return true;
		}
		stopNote(note) {
			var elKey = this.shadowRoot._noteKeyMap[note];
			if (!elKey || !elKey.classList.contains('active')) {
				return false;
			}
			dispatchEvent(this, 'stopnote', {note: elKey.note});
			elKey.classList.remove('active');
			return true;
		}
		stopAllNotes() {
			var elKeys = this.shadowRoot.getElementById('elKeys');
			var keys = elKeys.querySelectorAll('.active');
			for (var i = 0; i < keys.length; i++) {
				this.stopNote(keys[i].note);
			}
			return keys.length > 0;
		}
	}
	
	window.HTMLMidiKbdElement = HTMLMidiKbdElement;
	window.customElements.define('midi-kbd', HTMLMidiKbdElement);
})();
