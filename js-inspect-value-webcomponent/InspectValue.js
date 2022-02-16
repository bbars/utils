common: {
	const KEY_PROPERTY_NAME = Symbol('propertyName');
	const KEY_VALUE = Symbol('value');
	const KEY_LISTENERS = Symbol('listeners');
	
	const KEY_CHILDREN_RENDERED_LEVEL = Symbol('childrenRenderedLevel');
	const KEY_IGNORE_ATTRIBUTE_CHANGES = Symbol('ignoreAttributeChanges');
	
	class InfoText extends String {}
	
	class Getter extends Function {
		constructor(fn, thisArg) {
			const getter = () => fn.call(thisArg);
			Object.setPrototypeOf(getter, Getter.prototype);
			return getter;
		}
	}
	
	class ValueWrapper {
		constructor(value) {
			this[KEY_LISTENERS] = new Set();
			if (arguments.length > 0) {
				this.set(value);
			}
		}
		
		addListener(listener) {
			this[KEY_LISTENERS].add(listener);
			return this;
		}
		
		removeListener(listener) {
			this[KEY_LISTENERS].delete(listener);
			return this;
		}
		
		get() {
			return this[KEY_VALUE];
		}
		set(value) {
			this[KEY_VALUE] = value;
			for (const listener of this[KEY_LISTENERS]) {
				try {
					listener(value, this);
				}
				catch (err) {
					console.warn(err);
				}
			}
			return this[KEY_VALUE];
		}
	}
	
	InspectValue: {
		const TPL_BASE = document.createElement('template');
		TPL_BASE.innerHTML = `
			<style>
			
			:host {
				display: inline;
				font-family: monospace;
				cursor: default;
				--indent: 2em;
				--color-basic-property: #a2a;
				--color-undefined: #666;
				--color-boolean: #a2a;
				--color-null: #666;
				--color-number: #42d;
				--color-bigint: #262;
				--color-string: #d32;
				--color-symbol: #d32;
				--color-class: #42d;
				--color-function: inherit;
				--color-object: inherit;
				--color-error: #c60;
				--color-infotext: #888;
				--color-getter: #f0d;
				--content-getter: '(get)';
				--content-more: '\\2219\\2219\\2219';
				--greyed-opacity: 0.7;
			}
			:host #elWrapper {
			}
			:host #elContainer {
			}
			:host #elValueLine {
				display: inline-flex;
				max-width: 100%;
				flex-wrap: nowrap;
				gap: 1em;
			}
			:host #elValueLine #elMain {
				flex: 0 0 auto;
				max-width: 100%;
			}
			:host #elValueLine #elSlotBrief {
				flex: 0 1 auto;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			
			:host #elBtnToggleChildren:before {
				content: '\\25e2';
				/* background-image: url('data:image/svg+xml;utf8,<svg width="20" height="20" fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M 10 0  L 20 10  L 10 20  Z" /></svg>'); */
				font-style: initial;
				text-indent: 0;
				font-size: 0.8em;
				width: 1em;
				vertical-align: middle;
				line-height: 1em;
				height: 1em;
				text-align: center;
				margin-right: 0.15em;
				transform-origin: 65% 65%;
				transition: transform 100ms ease;
				transform: translate(0%, -25%) rotate(-45deg);
				
				display: none;
			}
			:host([expanded]) #elBtnToggleChildren:before {
				transform: translate(-10%, -25%) rotate(+45deg);
			}
			:host #elWrapper[iv-i-expandable] #elBtnToggleChildren:before {
				display: inline-block;
			}
			:host #elWrapper[iv-i-expandable] #elContainer {
				cursor: pointer;
			}
			:host([disabled]) #elWrapper[iv-i-expandable] #elContainer {
				cursor: not-allowed;
			}
			@media(hover: hover) and (pointer: fine) {
				:host(:not([disabled])) #elWrapper[iv-i-expandable] #elContainer:hover #elContents {
					text-decoration: underline;
				}
			}
			
			:host #elWrapper #elBtnGetter {
				color: var(--color-getter);
			}
			:host #elWrapper #elBtnGetter {
				cursor: pointer;
			}
			:host([disabled]) #elWrapper #elBtnGetter {
				cursor: not-allowed;
			}
			:host #elWrapper[iv-i-type="getter"] #elBtnGetter:before {
				content: var(--content-getter);
			}
			@media(hover: hover) and (pointer: fine) {
				:host(:not([disabled])) #elWrapper #elBtnGetter:hover {
					text-decoration: underline;
				}
			}
			:host #elWrapper:not([iv-i-type="getter"]) #elBtnGetter {
				display: none;
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
			:host #elWrapper[iv-i-type="symbol"] #elContents > slot {
				color: var(--color-symbol);
			}
			:host #elWrapper[iv-i-type="string"] #elContents:before,
			:host #elWrapper[iv-i-type="string"] #elContents:after {
				content: '"';
			}
			:host #elWrapper[iv-i-type="string"] #elContents > slot {
				color: var(--color-string);
				white-space: pre-wrap;
			}
			:host #elWrapper[iv-i-type="class"] #elContents > slot {
				font-style: italic;
				color: var(--color-class);
			}
			:host #elWrapper[iv-i-type="function"] #elContents > slot {
				font-style: italic;
				color: var(--color-function);
			}
			:host #elWrapper[iv-i-type="object"] #elContents > slot {
				color: var(--color-object);
				font-style: italic;
			}
			:host #elWrapper[iv-i-type="error"] #elContents > slot {
				color: var(--color-error);
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
				display: none;
			}
			:host #elSlotBrief {
				display: inline;
				font-style: italic;
				opacity: var(--greyed-opacity);
			}
			:host #elWrapper[iv-i-slot-empty-brief] #elSlotBrief {
				display: none;
			}
			
			:host #elChildren {
				padding-left: var(--indent);
			}
			:host #elWrapper {
				/*padding-left: var(--indent);*/
				/*text-indent: calc(-1 * var(--indent));*/
			}
			:host-context(inspect-value) #elChildren {
				/*padding-left: 0;*/ /* already spaced by #elWrapper */
			}
			:host([expanded]) #elChildren {
				display: flex;
				flex-direction: column;
			}
			:host([expanded]) #elSlotBrief {
				display: none;
			}
			
			:host #elBtnShowMore {
				display: inline-block;
				padding: 0.25em 0;
				line-height: 0.5em;
				
				margin-left: 2em;
				display: none;
			}
			:host(:not([disabled])) #elBtnShowMore {
				cursor: pointer;
			}
			:host([disabled]) #elBtnShowMore {
				cursor: not-allowed;
			}
			:host #elBtnShowMore:before {
				content: var(--content-more);
			}
			:host([expanded]) #elWrapper[iv-i-has-more] #elBtnShowMore {
				display: inline-block;
			}
			
			/* Property: */
			
			:host #elWrapper[iv-i-slot-empty-property] #elPropertyContainer {
				display: none;
			}
			
			:host([basic]) slot#elSlotProperty {
				color: var(--color-basic-property);
			}
			:host([hidden]) #elPropertyContainer {
				opacity: var(--greyed-opacity);
			}
			
			:host([enclosed]) #elPropertyContents:before {
				content: '[';
			}
			:host([enclosed]) #elPropertyContents:after {
				content: ']';
			}
			
			:host([virtual]:not([hidden])) #elPropertyContents:before,
			:host([virtual]:not([hidden])) #elPropertyContents:after {
				opacity: var(--greyed-opacity);
			}
			:host([virtual]) #elPropertyContents:before {
				content: '[[';
			}
			:host([virtual]) #elPropertyContents:after {
				content: ']]';
			}
			
			:host #elInherited {
				margin-right: 0.5em;
				display: none;
			}
			:host #elInherited:before {
				content: '\\21e1';
			}
			:host([inherited]) #elInherited {
				display: inline;
			}
			
			:host slot[name="value"] {
				display: inline;
				vertical-align: top;
				vertical-align: text-top;
			}
			
			/*:host slot::slotted(inspect-value) {
				display: inline !important;
			}*/
			:host slot#elSlotProperty::slotted(inspect-value) {
				display: inline !important;
			}
			
			</style>
			<span id="elWrapper" iv-i-slot-empty-property iv-i-slot-empty-brief>
				<span id="elValueLine">
					<span id="elMain">
						<span id="elPropertyContainer"><span id="elInherited"></span><span id="elPropertyContents"><slot name="property" id="elSlotProperty"></slot></span>: </span>
						<span id="elBtnGetter"></span>
						<span id="elContainer">
							<span id="elBtnToggleChildren"></span><span id="elContents"><slot></slot></span>
						</span>
					</span>
					<slot name="brief" id="elSlotBrief"></slot>
				</span>
				<slot name="children" id="elChildren"></slot>
				<span id="elBtnShowMore"></span>
			</span>
		`;
		TPL_BASE.innerHTML = TPL_BASE.innerHTML.trim().replace(/>[\t\n]+</g, '><');
		
		class InspectValue extends HTMLElement {
			[KEY_IGNORE_ATTRIBUTE_CHANGES] = 0;
			
			static get observedAttributes() {
				return ['disabled', 'expanded', 'enclosed', 'basic', 'inherited', 'virtual', 'hidden'];
			}
			
			static get observedBoolAttributes() {
				return ['disabled', 'expanded', 'enclosed', 'basic', 'inherited', 'virtual', 'hidden'];
			}
			
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
				this.shadowRoot.appendChild(TPL_BASE.content.cloneNode(true));
				this.shadowRoot.elWrapper = this.shadowRoot.getElementById('elWrapper');
				this.shadowRoot.elContainer = this.shadowRoot.getElementById('elContainer');
				this.shadowRoot.elBtnShowMore = this.shadowRoot.getElementById('elBtnShowMore');
				this.shadowRoot.elSlotProperty = this.shadowRoot.getElementById('elSlotProperty');
				this.shadowRoot.elSlotBrief = this.shadowRoot.getElementById('elSlotBrief');
				this.shadowRoot.elBtnGetter = this.shadowRoot.getElementById('elBtnGetter');
				this.shadowRoot.elBtnGetter.addEventListener('click', (event) => {
					if (this.disabled) {
						return;
					}
					this.evaluateGetter();
				});
				this.$$onValueWrapperChange = this.$$onValueWrapperChange.bind(this);
				this.$$onSlotChange = this.$$onSlotChange.bind(this);
				this.shadowRoot.elSlotProperty.addEventListener('slotchange', this.$$onSlotChange);
				this.shadowRoot.elSlotBrief.addEventListener('slotchange', this.$$onSlotChange);
			}
			
			static create(value, propertyName) {
				const res = new this();
				res.value = value;
				if (arguments.length > 1) {
					res.propertyName = propertyName;
				}
				return res;
			}
			
			static fromDescriptor(descriptor, parentValue) {
				const value = typeof descriptor.get === 'function'
					? new Getter(descriptor.get, parentValue)
					: descriptor.value
				;
				const res = descriptor.hasOwnProperty('name')
					? this.create(value, descriptor.name)
					: this.create(value)
				;
				res.inherited = descriptor.inherited || false;
				res.virtual = descriptor.virtual || false;
				res.hidden = !descriptor.enumerable && !descriptor.unhide;
				return res;
			}
			
			get value() {
				return this[KEY_VALUE] instanceof ValueWrapper
					? this[KEY_VALUE].get()
					: this[KEY_VALUE]
				;
			}
			set value(value) {
				if (this[KEY_VALUE] instanceof ValueWrapper) {
					this[KEY_VALUE].removeListener(this.$$onValueWrapperChange);
				}
				this[KEY_VALUE] = value;
				if (value instanceof ValueWrapper) {
					value.addListener(this.$$onValueWrapperChange);
				}
				this.expanded = false;
				this.renderValue();
			}
			
			get propertyName() {
				return this[KEY_PROPERTY_NAME];
			}
			set propertyName(propertyName) {
				this[KEY_PROPERTY_NAME] = propertyName;
				this.renderPropertyName();
			}
			
			get enclosed() {
				return this.hasAttribute('enclosed', false);
			}
			set enclosed(enclosed) {
				enclosed = !!enclosed;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('enclosed', enclosed);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			
			get basic() {
				return this.hasAttribute('basic', false);
			}
			set basic(basic) {
				basic = !!basic;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('basic', basic);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			
			get inherited() {
				return this.hasAttribute('inherited', false);
			}
			set inherited(inherited) {
				inherited = !!inherited;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('inherited', inherited);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			
			get virtual() {
				return this.hasAttribute('virtual', false);
			}
			set virtual(virtual) {
				virtual = !!virtual;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('virtual', virtual);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			
			get hidden() {
				return this.hasAttribute('hidden', false);
			}
			set hidden(hidden) {
				hidden = !!hidden;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('hidden', hidden);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
			}
			
			get expandable() {
				return this.value !== null
					&& !(this.value instanceof InfoText)
					&& !(this.value instanceof Getter)
					&& (typeof this.value === 'object' || typeof this.value === 'function')
				;
			}
			
			get expanded() {
				return this.hasAttribute('expanded');
			}
			set expanded(expanded) {
				expanded = !!expanded;
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				this.toggleAttribute('expanded', expanded);
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
				if (expanded) {
					let level = 1;
					if (level < this[KEY_CHILDREN_RENDERED_LEVEL]) {
						level = this[KEY_CHILDREN_RENDERED_LEVEL];
					}
					const value = this.value;
					if (value != null && value.constructor !== Object && value.constructor !== Array) {
						level = Math.max(level, 2);
					}
					this.renderChildren(level);
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
				const childrenInspectValueElements = this.querySelectorAll(':scope > inspect-value');
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
				this.shadowRoot.$$onClickShowMore = this.$$onClickShowMore.bind(this);
				
				this.shadowRoot.elContainer.addEventListener('click', this.shadowRoot.$$onClick);
				this.shadowRoot.elBtnShowMore.addEventListener('click', this.shadowRoot.$$onClickShowMore);
			}
			disconnectedCallback() {
				this.shadowRoot.elContainer.removeEventListener('click', this.shadowRoot.$$onClick);
				this.shadowRoot.elBtnShowMore.removeEventListener('click', this.shadowRoot.$$onClickShowMore);
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
				else if (this.constructor.observedBoolAttributes.indexOf(name) > -1) {
					this[name] = newValue || newValue === '' ? true : false;
				}
				else if (this.constructor.observedAttributes.indexOf(name) > -1) {
					this[name] = newValue;
				}
			}
			
			static getIvType(value) {
				if (value === null) {
					return 'null';
				}
				if (value instanceof Getter) {
					return 'getter';
				}
				if (value instanceof InfoText) {
					return 'infotext';
				}
				if (value instanceof Error) {
					return 'error';
				}
				const type = typeof value;
				if (type === 'function' && /^class\b/.test(value)) {
					return 'class';
				}
				return type;
			}
			
			/////////////////////////////////////////////
			/////////////////////////////////////////////
			/////////////////////////////////////////////
			
			renderValue() {
				for (let i = this.childNodes.length - 1; i >= 0; i--) {
					const node = this.childNodes[i];
					if (!node.slot || node.slot === 'children') {
						this.removeChild(node);
					}
				}
				this.expanded = false;
				delete this[KEY_CHILDREN_RENDERED_LEVEL];
				const value = this.value;
				const ivType = this.constructor.getIvType(value);
				let nodes = this.constructor._generateValueView(value, ivType);
				
				this.shadowRoot.elWrapper.setAttribute('iv-i-type', ivType);
				this.shadowRoot.elWrapper.toggleAttribute('iv-i-expandable', this.expandable);
				
				for (let node of nodes) {
					if (!(node instanceof Node)) {
						node = document.createTextNode(String(node));
					}
					this.appendChild(node);
				}
				
				this.renderBrief();
			}
			
			renderBrief() {
				const value = this.value;
				const ivType = this.constructor.getIvType(value);
				let briefNodes = this.constructor._generateValueBriefView(value, ivType);
				this._setBrief(briefNodes);
			}
			
			_setBrief(nodes) {
				for (let i = this.childNodes.length - 1; i >= 0; i--) {
					const node = this.childNodes[i];
					if (node.slot === 'brief') {
						this.removeChild(node);
					}
				}
				if (nodes && nodes.length > 0) {
					const elBrief = document.createElement('span');
					elBrief.slot = 'brief';
					for (let node of nodes) {
						if (!(node instanceof Node)) {
							node = document.createTextNode(String(node));
						}
						elBrief.appendChild(node);
					}
					this.appendChild(elBrief);
				}
			}
			
			renderPropertyName() {
				const propertyName = this.propertyName;
				for (let i = this.childNodes.length - 1; i >= 0; i--) {
					const node = this.childNodes[i];
					if (node.slot === 'property') {
						this.removeChild(node);
					}
				}
				const propertyNameIvType = InspectValue.getIvType(propertyName);
				
				let elPropertyName;
				if (propertyNameIvType === 'string') {
					this.enclosed = false;
					
					if (propertyName.trim() === '') {
						elPropertyName = InspectValue.create(propertyName);
						this.basic = false;
					}
					else {
						elPropertyName = document.createElement('span');
						elPropertyName.textContent = propertyName;
						this.basic = true;
					}
				}
				else {
					elPropertyName = InspectValue.create(propertyName);
					this.enclosed = true;
					this.basic = false;
				}
				elPropertyName.slot = 'property';
				this.appendChild(elPropertyName);
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
				const renderedNames = new Set();
				// const documentFragment = document.createDocumentFragment();
				for (const descriptor of allDescriptors) {
					if (descriptor.level >= levelLimit) {
						hasMore = true;
						break;
					}
					if (descriptor.hasOwnProperty('name')) {
						if (renderedNames.has(descriptor.name)) {
							continue;
						}
						renderedNames.add(descriptor.name);
					}
					if (descriptor.level < prevLevelLimit) {
						// skip already rendered descriptors
						continue;
					}
					const elProperty = this.constructor.fromDescriptor(descriptor, this.value);
					elProperty.slot = 'children';
					// elProperty._descriptor = descriptor; // debug
					this.appendChild(elProperty);
				}
				
				this.shadowRoot.elWrapper.toggleAttribute('iv-i-has-more', hasMore);
				this[KEY_CHILDREN_RENDERED_LEVEL] = levelLimit;
				return true;
			}
			
			evaluateGetter() {
				const getter = this.value;
				if (!(getter instanceof Getter)) {
					throw new Error(`Current value is not a getter`);
				}
				try {
					this.value = getter();
					return this.value;
				}
				catch (err) {
					// this.value = err;
					this._setBrief([this.constructor.create(err)]);
					// throw err;
				}
			}
			
			getPropertyNameNodes() {
				const res = [];
				for (const node of this.childNodes) {
					if (node.slot === 'property') {
						res.push(node);
					}
				}
				return res;
			}
			
			getValueNodes() {
				const res = [];
				for (const node of this.childNodes) {
					if (!node.slot) {
						res.push(node);
					}
				}
				return res;
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
			
			$$onClickShowMore(event) {
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
			
			$$onSlotChange(event) {
				const slot = event.target;
				const attrName = 'iv-i-slot-empty' + (!slot.name ? '' : '-' + slot.name)
				const isEmpty = event.target.assignedNodes().length === 0;
				this.shadowRoot.elWrapper.toggleAttribute(attrName, isEmpty);
			}
			
			$$onValueWrapperChange(value, valueWrapper) {
				this.renderValue();
			}
			
			static _generateValueView(value, ivType) {
				if (ivType === 'null') {
					return ['null'];
				}
				else if (ivType === 'infotext') {
					return [value.toString()];
				}
				else if (ivType === 'rawnodes') {
					return value;
				}
				else if (ivType === 'getter') {
					return [];
				}
				else if (ivType === 'error') {
					return [(value.constructor || Object).name];
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
					else {
						return [(value.constructor || Object).name];
					}
				}
				else if (ivType === 'string') {
					return this._generateValueViewString(value);
				}
				else if (ivType === 'bigint') {
					return [String(value) + 'n'];
				}
				else if (ivType === 'function') {
					return [`\u0192 ${value.name}`.trim()];
				}
				else if (ivType === 'class') {
					return [`class ${value.name}`.trim()];
				}
				return [String(value)];
			}
			
			static _generateValueViewString(value) {
				if (value.length < 500) {
					return [value];
				}
				const sliceSize = 200;
				const res = new Array(3);
				res[0] = document.createTextNode(value.slice(0, sliceSize));
				res[1] = document.createElement('span');
				res[1].className = 'collapsed-string-slice';
				res[1].textContent = value.slice(sliceSize, value.length - sliceSize);
				res[2] = document.createTextNode(value.slice(value.length - sliceSize));
				return res;
			}
			
			static _generateValueBriefView(value, ivType) {
				if (ivType === 'error') {
					return [String(value.message)];
				}
				else if (ivType === 'object') {
					if (value instanceof Array) {
						return [];
					}
					else if (value instanceof Set || value instanceof Map) {
						return [];
					}
					else if (value instanceof Date) {
						return [
							isNaN(value) ? 'Invalid Date' : value.toISOString(),
						];
					}
					else if (value instanceof HTMLElement) {
						try {
							return [
								`<${value.tagName.toLowerCase()}>`,
							];
						}
						catch (err) {
							return [];
						}
					}
					else if (value instanceof Promise) {
						const done = new ValueWrapper();
						done.set(new InfoText('Pending\u2026'));
						value
							.then(() => done.set(new InfoText('Resolved')))
							.catch(() => done.set(new InfoText('Error')))
						;
						return [this.create(done)];
					}
					else {
						return [];
					}
				}
				else if (ivType === 'function') {
					return this._generateValueBriefViewFunction(value)[0];
				}
				return undefined;
			}
			
			static _generateValueBriefViewFunction(value) {
				let res = '';
				const m = /^[^\(]*\((.*)\)\s*(?:\{|=>)/.exec(value);
				res += '(' + (!m ? '' : m[1]).trim() + ')';
				return [res];
			}
			
			static *_getDescriptors(obj0, includeExtra) {
				if (includeExtra) {
					yield* this._getDescriptorsExtra(obj0);
				}
				const set = new Set();
				for (let obj = obj0, level = 0; obj !== null; obj = Object.getPrototypeOf(obj), level++) {
					let descriptors = Object.getOwnPropertyDescriptors(obj);
					let keys = Object.getOwnPropertyNames(obj)
						.concat(Object.getOwnPropertySymbols(obj))
					;
					for (const k of keys) {
						if (!set.has(k)) {
							const descriptor = descriptors[k];
							descriptor.name = k;
							descriptor.level = level;
							descriptor.inherited = obj != obj0;
							yield descriptor;
						}
					}
				}
			}
			
			static *_getDescriptorsExtra(obj0) {
				if (obj0 instanceof Boolean || obj0 instanceof Number || obj0 instanceof String || obj0 instanceof BigInt) {
					yield {
						name: 'PrimitiveValue',
						virtual: true,
						value: obj0.valueOf(),
					};
				}
				else if (obj0 instanceof Set) {
					for (const entry of obj0) {
						yield {
							// name: prepend.length,
							virtual: true,
							unhide: true,
							value: entry,
						};
					}
				}
				else if (obj0 instanceof Map) {
					for (const entry of obj0.entries()) {
						yield {
							name: entry[0],
							// name: prepend.length,
							virtual: true,
							unhide: true,
							value: entry[1],
						};
					}
				}
				else if (obj0 instanceof Date) {
					yield {
						name: 'toString()',
						virtual: true,
						value: obj0.toString(),
					};
					yield {
						name: 'getTime()',
						virtual: true,
						value: obj0.getTime(),
					};
				}
				else if (obj0 instanceof Function) {
					yield {
						// name: 'toString()',
						virtual: true,
						unhide: true,
						value: new InfoText(obj0.toString()),
					};
				}
				else if (obj0 instanceof Promise) {
					const done = new ValueWrapper();
					const res = new ValueWrapper();
					const err = new ValueWrapper();
					yield {
						name: 'Done',
						virtual: true,
						unhide: true,
						value: done,
					};
					yield {
						name: 'Result',
						virtual: true,
						unhide: true,
						value: res,
					};
					yield {
						name: 'Error',
						virtual: true,
						unhide: true,
						value: err,
					};
					obj0.then(res.set.bind(res), err.set.bind(err)).finally(() => done.set(true));
				}
			}
		}
		
		InspectValue.InfoText = InfoText;
		InspectValue.Getter = Getter;
		InspectValue.ValueWrapper = ValueWrapper;
		window.InspectValue = InspectValue;
		window.customElements.define('inspect-value', InspectValue);
	}
}
