InspectValueProperty: {
	const TPL_BASE = document.createElement('template');
	TPL_BASE.innerHTML = `
		<style>
		
		:host {
			display: block;
		}
		:host #elWrapper {
		}
		:host([iv-unnamed]) #elContainer {
			display: none;
		}
		
		:host slot:not([name]) {
			color: #a2a;
		}
		:host([iv-property-type="symbol"]) slot:not([name]) {
			color: #d32;
		}
		:host([iv-hidden]) #elContainer {
			opacity: 0.5;
		}
		:host(:not([iv-enumerable])) #elContainer {
			opacity: 0.5;
		}
		:host([iv-virtual]) #elContainer {
			opacity: 1;
		}
		
		:host([iv-property-type="symbol"]) #elContents:before {
			content: '[';
		}
		:host([iv-property-type="symbol"]) #elContents:after {
			content: ']';
		}
		
		:host([iv-virtual]) #elContents:before,
		:host([iv-virtual]) #elContents:after {
			opacity: 0.5;
		}
		:host([iv-virtual]) #elContents:before {
			content: '[[';
		}
		:host([iv-virtual]) #elContents:after {
			content: ']]';
		}
		
		:host #elInherited {
			margin-right: 0.5em;
			display: none;
		}
		:host #elInherited:before {
			content: '\\21e1';
		}
		:host([iv-inherited]) #elInherited {
			display: inline;
		}
		
		:host slot[name="value"] {
			display: inline;
			vertical-align: top;
			vertical-align: text-top;
		}
		
		:host slot::slotted(inspect-value) {
			display: inline !important;
		}
		:host slot[name="value"]::slotted(inspect-value) {
			display: inline !important;
		}
		
		</style>
		<div id="elWrapper">
			<span id="elContainer"><span id="elInherited"></span><span id="elContents"><slot></slot></span>: </span><slot name="value"></slot>
		</div>
	`;
	
	class InspectValueProperty extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.appendChild(TPL_BASE.content.cloneNode(true));
			this.shadowRoot.elContainer = this.shadowRoot.getElementById('elContainer');
		}
	}
	
	window.InspectValueProperty = InspectValueProperty;
	window.customElements.define('inspect-value-property', InspectValueProperty);
}

InspectValue: {
	const TPL_BASE = document.createElement('template');
	TPL_BASE.innerHTML = `
		<style>
		
		:host {
			display: inline;
			font-family: monospace;
			--max-string-length: 500;
			--color-undefined: #888;
			--color-boolean: #a2a;
			--color-null: #a2a;
			--color-number: #42d;
			--color-bigint: #262;
			--color-string: #d32;
			--color-function: inherit;
			--color-object: inherit;
			--color-infotext: #888;
		}
		:host #elWrapper {
		}
		:host #elContainer {
		}
		
		:host #elBtnToggleChildren:before {
			content: '\\25b6';
			font-style: initial;
			text-indent: 0;
			font-size: 0.75em;
			width: 1em;
			vertical-align: middle;
			line-height: 1em;
			height: 1em;
			text-align: left;
			margin-right: 0.15em;
			color: #444;
			transform-origin: 40% 40%;
			transition: transform 100ms ease;
			
			display: none;
		}
		:host([expanded]) #elBtnToggleChildren:before {
			transform: rotate(90deg);
		}
		:host #elWrapper[iv-i-expandable] #elBtnToggleChildren:before {
			display: inline-block;
		}
		:host #elWrapper[iv-i-expandable] #elContainer {
			cursor: pointer;
		}
		:host #elWrapper[iv-i-expandable] #elContainer:hover #elContents {
			text-decoration: underline;
		}
		
		:host #elWrapper[iv-i-type="undefined"] #elContents > slot {
			color: var(--color-undefined);
		}
		:host #elWrapper[iv-i-type="boolean"] #elContents > slot {
			color: var(--color-boolean);
		}
		:host #elWrapper[iv-i-type="null"] #elContents > slot {
			color: var(--color-null);
		}
		:host #elWrapper[iv-i-type="number"] #elContents > slot {
			color: var(--color-number);
		}
		:host #elWrapper[iv-i-type="bigint"] #elContents > slot {
			color: var(--color-bigint);
		}
		:host #elWrapper[iv-i-type="string"] #elContents:before,
		:host #elWrapper[iv-i-type="string"] #elContents:after {
			content: '"';
		}
		:host #elWrapper[iv-i-type="string"] #elContents > slot {
			color: var(--color-string);
			white-space: pre-wrap;
		}
		:host #elWrapper[iv-i-type="function"] #elContents > slot {
			color: var(--color-function);
			white-space: pre-wrap;
			font-style: italic;
		}
		:host #elWrapper[iv-i-type="object"] #elContents > slot {
			color: var(--color-object);
			font-style: italic;
		}
		:host #elWrapper[iv-i-type="infotext"] #elContents > slot {
			color: var(--color-infotext);
			font-style: italic;
		}
		
		:host slot:not([name])::slotted(.collapsed-string-slice) {
			display: inline-block;
			width: 1em;
			height: 1em;
			line-height: 1em;
			overflow: hidden;
			color: transparent;
			vertical-align: middle;
			margin: -1em 0.5em;
			border-radius: 3px;
			background: #d32;
		}
		
		:host #elChildren {
			padding-left: 2em;
			display: none;
		}
		:host([expanded]) #elChildren {
			display: block;
		}
		
		:host #elBtnShowDeeper {
			display: inline-block;
			padding: 0.25em 0;
			line-height: 0.5em;
			cursor: pointer;
			
			margin-left: 2em;
			display: none;
		}
		:host #elBtnShowDeeper:before {
			content: '\\2219\\2219\\2219';
		}
		:host([expanded]) #elWrapper[iv-i-has-more] #elBtnShowDeeper {
			display: inline-block;
		}
		
		</style>
		<span id="elWrapper">
			<span id="elContainer">
				<span id="elBtnToggleChildren"></span><span id="elContents"><slot></slot></span>
			</span>
			<slot name="children" id="elChildren"></slot>
			<span id="elBtnShowDeeper"></span>
		</span>
	`;
	
	const KEY_VALUE = Symbol('value');
	const KEY_CHILDREN_RENDERED_LEVEL = Symbol('childrenRenderedLevel');
	const KEY_IGNORE_ATTRIBUTE_CHANGES = Symbol('ignoreAttributeChanges');
	
	class InfoText extends String {}
	
	class InspectValue extends HTMLElement {
		[KEY_IGNORE_ATTRIBUTE_CHANGES] = 0;
		
		static get observedAttributes() {
			return ['disabled', 'expanded'];
		}
		
		constructor(value) {
			super();
			this.attachShadow({ mode: 'open' });
			this.shadowRoot.appendChild(TPL_BASE.content.cloneNode(true));
			this.shadowRoot.elWrapper = this.shadowRoot.getElementById('elWrapper');
			this.shadowRoot.elContainer = this.shadowRoot.getElementById('elContainer');
			this.shadowRoot.elBtnShowDeeper = this.shadowRoot.getElementById('elBtnShowDeeper');
			
			this.value = value;
		}
		
		get value() {
			return this[KEY_VALUE];
		}
		set value(value) {
			this[KEY_VALUE] = value;
			this.render();
		}
		
		get expandable() {
			return this.value !== null
				&& !(this.value instanceof InfoText)
				&& (typeof this.value === 'object' || typeof this.value === 'function')
			;
		}
		
		get expanded() {
			return this.hasAttribute('expanded');
		}
		set expanded(value) {
			value = !!value;
			if (!value) {
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('expanded', false);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			else {
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('expanded', true);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
				this.renderChildren(this[KEY_CHILDREN_RENDERED_LEVEL] || 1);
			}
		}
		
		expand(depth) {
			if (depth > 0xfff) {
				throw new Error(`Value for 'depth' is too large`);
			}
			if (depth <= 0) {
				this.expanded = false;
				return;
			}
			this.expanded = true;
			let res = 1;
			const childrenInspectValueElements = this.querySelectorAll(':scope > inspect-value, :scope > inspect-value-property > inspect-value');
			for (const child of childrenInspectValueElements) {
				if (!child.expandable) {
					continue;
				}
				res += child.expand(depth - 1);
			}
			return res;
		}
		
		connectedCallback() {
			this.shadowRoot.$$onClick = this.$$onClick.bind(this);
			this.shadowRoot.$$onClickShowDeeper = this.$$onClickShowDeeper.bind(this);
			
			this.shadowRoot.elContainer.addEventListener('click', this.shadowRoot.$$onClick);
			this.shadowRoot.elBtnShowDeeper.addEventListener('click', this.shadowRoot.$$onClickShowDeeper);
		}
		disconnectedCallback() {
			this.shadowRoot.elContainer.removeEventListener('click', this.shadowRoot.$$onClick);
			this.shadowRoot.elBtnShowDeeper.removeEventListener('click', this.shadowRoot.$$onClickShowDeeper);
		}
		
		get disabled() {
			return this.hasAttribute('disabled');
		}
		set disabled(value) {
			value = !!value;
			this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
			this.toggleAttribute('disabled', value);
			this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
		}
		
		attributeChangedCallback(name, oldValue, newValue) {
			if (this[KEY_IGNORE_ATTRIBUTE_CHANGES]) {
				return;
			}
			if (oldValue === newValue) {
				return;
			}
			else if (this.constructor.observedAttributes.indexOf(name) > -1) {
				this[name] = newValue;
			}
		}
		
		static getIvType(value) {
			if (value === null) {
				return 'null';
			}
			if (value instanceof InfoText) {
				return 'infotext';
			}
			return typeof value;
		}
		
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		
		render() {
			delete this[KEY_CHILDREN_RENDERED_LEVEL];
			while (this.children[0]) {
				this.removeChild(this.children[0]);
			}
			const value = this.value;
			const ivType = this.constructor.getIvType(value);
			let displayValueNodes = this._generateValueView(value, ivType);
			
			this.shadowRoot.elWrapper.setAttribute('iv-i-type', ivType);
			this.shadowRoot.elWrapper.toggleAttribute('iv-i-expandable', this.expandable);
			
			for (let node of displayValueNodes) {
				if (!(node instanceof Node)) {
					node = document.createTextNode(String(node));
				}
				this.appendChild(node);
			}
		}
		
		renderChildren(levelLimit) {
			if (!levelLimit || levelLimit < 0) {
				levelLimit = Infinity;
			}
			let prevLevelLimit = this[KEY_CHILDREN_RENDERED_LEVEL] || 0;
			if (levelLimit === prevLevelLimit) {
				return false;
			}
			if (levelLimit < prevLevelLimit) {
				prevLevelLimit = 0; // reset
				for (let i = this.children.length - 1; i >= 0; i--) {
					const child = this.children[i];
					if (child.slot === 'children') {
						child.parentElement.removeChild(child);
					}
				}
			}
			
			const allDescriptors = this.constructor._getDescriptors(
				this.value
				, prevLevelLimit === 0
				, levelLimit + 1
			);
			let hasMore = false;
			for (const descriptor of allDescriptors) {
				if (descriptor.level >= levelLimit) {
					hasMore = true;
					break;
				}
				if (descriptor.level < prevLevelLimit) {
					continue;
				}
				const elProperty = document.createElement('inspect-value-property');
				elProperty.slot = 'children';
				elProperty.setAttribute('iv-property-type', this.constructor.getIvType(descriptor.name));
				elProperty.setAttribute('iv-value-type', this.constructor.getIvType(descriptor.value));
				elProperty.toggleAttribute('iv-inherited', descriptor.inherited || false);
				elProperty.toggleAttribute('iv-virtual', descriptor.virtual || false);
				elProperty.toggleAttribute('iv-enumerable', descriptor.enumerable || false);
				if (descriptor.name == null) {
					elProperty.toggleAttribute('iv-unnamed', true);
				}
				else if (typeof descriptor.name !== 'object') {
					elProperty.textContent = String(descriptor.name);
				}
				else {
					elProperty.appendChild(new this.constructor(descriptor.name));
				}
				elProperty._descriptor = descriptor;
				
				const elPropertyValue = new this.constructor(descriptor.value);
				elPropertyValue.slot = 'value';
				elProperty.appendChild(elPropertyValue);
				
				this.appendChild(elProperty);
			}
			
			this.shadowRoot.elWrapper.toggleAttribute('iv-i-has-more', hasMore);
			this[KEY_CHILDREN_RENDERED_LEVEL] = levelLimit;
			return true;
		}
		
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		/////////////////////////////////////////////
		
		$$onClick(event) {
			if (this.disabled) {
				return;
			}
			if (!this.expandable) {
				return;
			}
			this.expanded = !this.expanded;
		}
		
		$$onClickShowDeeper(event) {
			if (this.disabled) {
				return;
			}
			if (!this.expandable) {
				return;
			}
			this.renderChildren(
				this[KEY_CHILDREN_RENDERED_LEVEL]
					? Infinity
					: (this[KEY_CHILDREN_RENDERED_LEVEL] || 9) + 1
			);
		}
		
		_generateValueView(value, ivType) {
			if (ivType === 'null') {
				return ['null'];
			}
			else if (ivType === 'infotext') {
				return [value.toString()];
			}
			else if (ivType === 'object') {
				if (value instanceof Array) {
					return [
						`${value.constructor.name}(${value.length})`,
					];
				}
				else if (value instanceof Set || value instanceof Map) {
					return [
						`${value.constructor.name}(${value.size})`,
					];
				}
				else if (value instanceof Date) {
					return [
						`${value.constructor.name}(${isNaN(value) ? 'Invalid Date' : value.toISOString()})`,
					];
				}
				else {
					return [(value.constructor || Object).name];
				}
			}
			else if (ivType === 'string' && value.length > 500) {
				const sliceSize = 200;
				const res = new Array(3);
				res[0] = document.createTextNode(value.slice(0, sliceSize));
				res[1] = document.createElement('span');
				res[1].className = 'collapsed-string-slice';
				res[1].textContent = value.slice(sliceSize, value.length - sliceSize);
				res[2] = document.createTextNode(value.slice(value.length - sliceSize));
				return res;
			}
			else if (ivType === 'bigint') {
				return [String(value) + 'n'];
			}
			else if (ivType === 'function') {
				return ['Function'];
			}
			return [String(value)];
		}
		
		static _getDescriptors(obj0, includeExtra, levelLimit) {
			const map = new Map();
			if (!levelLimit || levelLimit < 0) {
				levelLimit = Infinity;
			}
			for (let obj = obj0, level = 0; obj !== null && level < levelLimit; obj = Object.getPrototypeOf(obj), level++) {
				let descriptors = Object.getOwnPropertyDescriptors(obj);
				let keys = Object.getOwnPropertyNames(obj)
					.concat(Object.getOwnPropertySymbols(obj))
				;
				for (const k of keys) {
					if (!map.has(k)) {
						const descriptor = descriptors[k];
						descriptor.name = k;
						descriptor.level = level;
						descriptor.inherited = obj != obj0;
						map.set(k, descriptor);
					}
				}
			}
			const descriptors = Array.from(map.values());
			if (includeExtra) {
				this._getExtra(obj0, descriptors);
			}
			return descriptors;
		}
		
		static _getExtra(obj0, descriptors) {
			if (obj0 instanceof Boolean || obj0 instanceof Number || obj0 instanceof String || obj0 instanceof BigInt) {
				descriptors.unshift({
					name: 'PrimitiveValue',
					virtual: true,
					value: obj0.valueOf(),
				});
			}
			else if (obj0 instanceof Set) {
				const prepend = [];
				for (const entry of obj0) {
					prepend.push({
						// name: prepend.length,
						virtual: true,
						value: entry,
					});
				}
				descriptors.unshift(...prepend);
			}
			else if (obj0 instanceof Map) {
				const prepend = [];
				for (const entry of obj0.entries()) {
					prepend.push({
						name: entry[0],
						// name: prepend.length,
						virtual: true,
						value: entry[1],
					});
				}
				descriptors.unshift(...prepend);
			}
			else if (obj0 instanceof Date) {
				descriptors.unshift(
					{
						name: 'toString()',
						virtual: true,
						value: obj0.toString(),
					},
					{
						name: 'getTime()',
						virtual: true,
						value: obj0.getTime(),
					},
				);
			}
			else if (obj0 instanceof Function) {
				descriptors.unshift({
					// name: 'toString()',
					virtual: true,
					value: new InfoText(obj0.toString()),
				});
			}
		}
	}
	
	window.InspectValue = InspectValue;
	window.customElements.define('inspect-value', InspectValue);
}
