common: {
	const KEY_PROPERTY_NAME = Symbol('propertyName');
	const KEY_VALUE = Symbol('value');
	const KEY_LISTENERS = Symbol('listeners');
	
	const KEY_CHILDREN_RENDERED_LEVEL = Symbol('childrenRenderedLevel');
	const KEY_CHILDREN_RENDERED_ITEMS = Symbol('childrenRenderedItems');
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
				gap: 0.5em;
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
				max-height: 1.2em;
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
				opacity: var(--greyed-opacity);
				
				display: none;
			}
			:host([expanded]) #elBtnToggleChildren:before {
				transform: translate(-10%, -25%) rotate(+45deg);
			}
			:host(:not([noexpand])) #elWrapper[iv-i-expandable] #elBtnToggleChildren:before {
				display: inline-block;
			}
			:host(:not([noexpand])) #elWrapper[iv-i-expandable] #elContainer {
				cursor: pointer;
			}
			:host([disabled]) #elWrapper[iv-i-expandable] #elContainer {
				cursor: not-allowed;
			}
			:host(:not([disabled]):not([noexpand])) #elWrapper[iv-i-expandable] #elContainer:active #elContents {
				text-decoration: underline;
			}
			@media(hover: hover) and (pointer: fine) {
				:host(:not([disabled]):not([noexpand])) #elWrapper[iv-i-expandable] #elContainer:hover #elContents {
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
			:host(:not([disabled])) #elWrapper #elBtnGetter:active {
				text-decoration: underline;
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
			
			:host #elSlot::slotted(.collapsed-string-slice) {
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
			
			:host #elSlotChildren {
				display: none;
			}
			:host #elSlotBrief {
				display: inline;
				font-style: italic;
				opacity: var(--greyed-opacity);
				white-space: nowrap;
			}
			:host #elWrapper[iv-i-slot-empty-brief] #elSlotBrief,
			:host([nobrief]) #elWrapper #elSlotBrief {
				display: none;
			}
			
			:host #elSlotChildren {
				padding-left: var(--indent);
			}
			:host #elWrapper {
				/*padding-left: var(--indent);*/
				/*text-indent: calc(-1 * var(--indent));*/
			}
			:host-context(inspect-value) #elSlotChildren {
				/*padding-left: 0;*/ /* already spaced by #elWrapper */
			}
			:host([expanded]) #elSlotChildren {
				display: flex;
				flex-direction: column;
			}
			:host([expanded]) #elSlotBrief {
				display: none;
			}
			
			:host #elBtnShowMore {
				display: inline-block;
				padding: 0.25em;
				line-height: 0.5em;
				margin-left: 2em;
				border-radius: 3px;
				border: transparent 1px solid;
				
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
			:host(:not([disabled])) #elBtnShowMore:active {
				border-color: currentColor;
			}
			@media(hover: hover) and (pointer: fine) {
				:host(:not([disabled])) #elBtnShowMore:hover {
					border-color: currentColor;
				}
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
							<span id="elBtnToggleChildren"></span><span id="elContents"><slot id="elSlot"></slot></span>
						</span>
					</span>
					<slot name="brief" id="elSlotBrief"></slot>
				</span>
				<slot name="children" id="elSlotChildren"></slot>
				<span id="elBtnShowMore"></span>
			</span>
		`;
		TPL_BASE.innerHTML = TPL_BASE.innerHTML.trim().replace(/>[\t\n]+</g, '><');
		
		class InspectValue extends HTMLElement {
			[KEY_IGNORE_ATTRIBUTE_CHANGES] = 0;
			
			static get observedAttributes() {
				return ['disabled', 'expanded', 'enclosed', 'basic', 'inherited', 'virtual', 'hidden', 'noexpand', 'nobrief'];
			}
			
			static get observedBoolAttributes() {
				return ['disabled', 'expanded', 'enclosed', 'basic', 'inherited', 'virtual', 'hidden', 'noexpand', 'nobrief'];
			}
			
			constructor() {
				super();
				this.attachShadow({ mode: 'open' });
				this.shadowRoot.appendChild(TPL_BASE.content.cloneNode(true));
				this.shadowRoot.elWrapper = this.shadowRoot.getElementById('elWrapper');
				this.shadowRoot.elContainer = this.shadowRoot.getElementById('elContainer');
				this.shadowRoot.elBtnShowMore = this.shadowRoot.getElementById('elBtnShowMore');
				this.shadowRoot.elSlot = this.shadowRoot.getElementById('elSlot');
				this.shadowRoot.elSlotProperty = this.shadowRoot.getElementById('elSlotProperty');
				this.shadowRoot.elSlotBrief = this.shadowRoot.getElementById('elSlotBrief');
				this.shadowRoot.elSlotChildren = this.shadowRoot.getElementById('elSlotChildren');
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
			
			connectedCallback() {
				this.shadowRoot.$$onClick = this.$$onClick.bind(this);
				this.shadowRoot.$$onMouseDown = this.$$onMouseDown.bind(this);
				this.shadowRoot.$$onClickShowMore = this.$$onClickShowMore.bind(this);
				
				this.shadowRoot.elContainer.addEventListener('click', this.shadowRoot.$$onClick);
				this.shadowRoot.elContainer.addEventListener('mousedown', this.shadowRoot.$$onMouseDown);
				this.shadowRoot.elBtnShowMore.addEventListener('click', this.shadowRoot.$$onClickShowMore);
			}
			disconnectedCallback() {
				this.shadowRoot.elContainer.removeEventListener('click', this.shadowRoot.$$onClick);
				this.shadowRoot.elContainer.removeEventListener('mousedown', this.shadowRoot.$$onMouseDown);
				this.shadowRoot.elBtnShowMore.removeEventListener('click', this.shadowRoot.$$onClickShowMore);
			}
			
			attributeChangedCallback(name, oldValue, newValue) {
				if (this[KEY_IGNORE_ATTRIBUTE_CHANGES]) {
					return;
				}
				if (oldValue === newValue) {
					return;
				}
				else if (this.constructor.observedBoolAttributes.indexOf(name) > -1) {
					oldValue = oldValue || oldValue === '' ? true : false;
					newValue = newValue || newValue === '' ? true : false;
					if (oldValue === newValue) {
						return;
					}
					this[name] = newValue;
				}
				else if (this.constructor.observedAttributes.indexOf(name) > -1) {
					this[name] = newValue;
				}
			}
			
			static create(value, propertyName) {
				const res = new this();
				res.value = value;
				if (arguments.length > 1) {
					res.propertyName = propertyName;
				}
				return res;
			}
			
			static createSimple(value, propertyName) {
				const res = new this();
				res.noexpand = true;
				res.nobrief = true;
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
			
			get rawValue() {
				return this[KEY_VALUE];
			}
			set rawValue(rawValue) {
				if (this[KEY_VALUE] instanceof ValueWrapper) {
					this[KEY_VALUE].removeListener(this.$$onValueWrapperChange);
				}
				this[KEY_VALUE] = rawValue;
				if (rawValue instanceof ValueWrapper) {
					rawValue.addListener(this.$$onValueWrapperChange);
				}
				this.renderValue();
			}
			
			get value() {
				return this[KEY_VALUE] instanceof ValueWrapper
					? this[KEY_VALUE].get()
					: this[KEY_VALUE]
				;
			}
			set value(value) {
				this.rawValue = value;
			}
			
			get propertyName() {
				return this[KEY_PROPERTY_NAME];
			}
			set propertyName(propertyName) {
				this[KEY_PROPERTY_NAME] = propertyName;
				this.renderPropertyName();
			}
			
			get nobrief() {
				return this.hasAttribute('nobrief');
			}
			set nobrief(nobrief) {
				this._toggleAttributeQuiet('nobrief', !!nobrief);
			}
			
			get disabled() {
				return this.hasAttribute('disabled');
			}
			set disabled(disabled) {
				this._toggleAttributeQuiet('disabled', !!disabled);
			}
			
			get enclosed() {
				return this.hasAttribute('enclosed', false);
			}
			set enclosed(enclosed) {
				this._toggleAttributeQuiet('enclosed', !!enclosed);
			}
			
			get basic() {
				return this.hasAttribute('basic', false);
			}
			set basic(basic) {
				basic = !!basic;
				this._toggleAttributeQuiet('basic', basic);
			}
			
			get inherited() {
				return this.hasAttribute('inherited', false);
			}
			set inherited(inherited) {
				this._toggleAttributeQuiet('inherited', !!inherited);
			}
			
			get virtual() {
				return this.hasAttribute('virtual', false);
			}
			set virtual(virtual) {
				this._toggleAttributeQuiet('virtual', !!virtual);
			}
			
			get hidden() {
				return this.hasAttribute('hidden', false);
			}
			set hidden(hidden) {
				this._toggleAttributeQuiet('hidden', !!hidden);
			}
			
			get noexpand() {
				return this.hasAttribute('noexpand', false);
			}
			set noexpand(noexpand) {
				this._toggleAttributeQuiet('noexpand', !!noexpand);
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
				const prevExpanded = this.hasAttribute('expanded');
				this._toggleAttributeQuiet('expanded', expanded);
				if (expanded && !prevExpanded) {
					this.expand();
				}
			}
			
			_toggleAttributeQuiet(...args) {
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]++;
				try {
					this.toggleAttribute(...args);
				}
				finally {
				this[KEY_IGNORE_ATTRIBUTE_CHANGES]--;
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
				
				delete this[KEY_CHILDREN_RENDERED_LEVEL];
				if (this.expanded) {
					this.expand(); // re-render
				}
				
				if (!this.nobrief) {
					this.renderBrief();
				}
			}
			
			renderSecondary() {
				if (this.expandable) {
					this.renderChildren(false, true); // re-render
				}
				if (!this.nobrief) {
					this.renderBrief();
				}
			}
			
			renderBrief() {
				const value = this.value;
				const ivType = this.constructor.getIvType(value);
				let briefNodes = this.constructor._generateValueBriefView(value, ivType);
				this._setBrief(briefNodes);
			}
			
			_setBrief(nodes) {
				for (const el of this.shadowRoot.elSlotBrief.assignedNodes()) {
					el.parentElement.removeChild(el);
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
				for (const el of this.shadowRoot.elSlotProperty.assignedNodes()) {
					el.parentElement.removeChild(el);
				}
				const propertyNameIvType = InspectValue.getIvType(propertyName);
				
				let elPropertyName;
				if (propertyNameIvType === 'string') {
					this.enclosed = false;
					
					if (propertyName.trim() === '') {
						elPropertyName = InspectValue.create(propertyName);
						elPropertyName.nobrief = true;
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
					elPropertyName.nobrief = true;
					this.enclosed = true;
					this.basic = false;
				}
				elPropertyName.slot = 'property';
				this.appendChild(elPropertyName);
			}
			
			renderChildren(showMore, force) {
				let maxLevel = this[KEY_CHILDREN_RENDERED_LEVEL];
				if (showMore) {
					maxLevel++;
				}
				else if (maxLevel == null) {
					maxLevel = this._suggestExpandLevel();
				}
				let prevRenderedCnt = this[KEY_CHILDREN_RENDERED_ITEMS] || 0;
				let maxRows = 100;
				if (force) {
					// reset
					maxRows = prevRenderedCnt;
					prevRenderedCnt = 0;
					maxLevel = this[KEY_CHILDREN_RENDERED_LEVEL];
					for (const el of this.shadowRoot.elSlotChildren.assignedNodes()) {
						el.parentElement.removeChild(el);
					}
				}
				let renderedCnt = 0;
				let totalCnt = 0;
				let hasMore = false;
				let updateLevel = this[KEY_CHILDREN_RENDERED_LEVEL];
				
				const value = this.value;
				const allDescriptors = this.constructor._getDescriptors(value, true, true);
				
				for (const descriptor of allDescriptors) {
					const level = descriptor.level || 0;
					if (level > maxLevel) {
						if (renderedCnt === 0 && showMore) {
							maxLevel++;
						}
						else {
							hasMore = true;
							break;
						}
					}
					updateLevel = level;
					if (renderedCnt >= maxRows) {
						hasMore = true;
						break;
					}
					totalCnt++;
					if (totalCnt <= prevRenderedCnt) {
						// skip already rendered descriptors
						continue;
					}
					renderedCnt++;
					const elProperty = this.constructor.fromDescriptor(descriptor, value);
					elProperty.slot = 'children';
					this.appendChild(elProperty);
				}
				
				this.shadowRoot.elWrapper.toggleAttribute('iv-i-has-more', hasMore);
				this[KEY_CHILDREN_RENDERED_LEVEL] = updateLevel;
				this[KEY_CHILDREN_RENDERED_ITEMS] = totalCnt;
				return true;
			}
			
			expand(depth = 0) {
				depth = (depth | 0) || 0;
				if (depth > 0xfff) {
					throw new Error(`Value for 'depth' is too large`);
				}
				if (depth < 0) {
					this.expanded = false;
					return 0;
				}
				this.expanded = true;
				
				this.renderChildren(false);
				let res = 1;
				if (depth > 0) {
					const childrenIvEls = this.querySelectorAll(':scope > inspect-value[slot="children"]');
					for (const child of childrenIvEls) {
						if (!child.expandable) {
							continue;
						}
						res += child.expand(depth - 1);
					}
				}
				return res;
			}
			
			evaluateGetter() {
				const getter = this.value;
				if (!(getter instanceof Getter)) {
					throw new Error(`Current value is not a getter`);
				}
				try {
					this._setBrief([]);
					this.value = getter();
					return this.value;
				}
				catch (err) {
					// this.value = err;
					const el = this.constructor.create(err);
					el.noexpand = true;
					this._setBrief([el]);
					// throw err;
				}
			}
			
			_suggestExpandLevel() {
				let level = 1;
				const value = this.value;
				const simpleConstructors = [
					Object,
					Array,
					Boolean,
					Number,
					BigInt,
					String,
				];
				if (value != null && simpleConstructors.indexOf(value.constructor) > -1) {
					level = 0;
				}
				return level;
			}
			
			/////////////////////////////////////////////
			/////////////////////////////////////////////
			/////////////////////////////////////////////
			
			$$onClick(event) {
				if (this.disabled) {
					return;
				}
				if (this.noexpand) {
					return;
				}
				if (!this.expandable) {
					return;
				}
				this.expanded = !this.expanded;
			}
			
			$$onMouseDown(event) {
				if (this.disabled) {
					return;
				}
				if (event.button === 0) {
					event.preventDefault();
				}
				else if (event.button === 1) {
					event.preventDefault();
					this.renderSecondary();
				}
			}
			
			$$onClickShowMore(event) {
				if (this.disabled) {
					return;
				}
				if (!this.expandable) {
					return;
				}
				this.renderChildren(true);
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
						return [`${value.constructor.name}(${value.length})`];
					}
					else if (value instanceof Set || value instanceof Map) {
						return [`${value.constructor.name}(${value.size})`];
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
						return this._generateValueBriefViewArray(value);
					}
					else if (value instanceof Set || value instanceof Map) {
						return [];
					}
					else if (value instanceof Boolean || value instanceof Number || value instanceof BigInt || value instanceof String) {
						return ['{', this.createSimple(value.valueOf()), '}'];
					}
					else if (value instanceof Date) {
						return [
							isNaN(value)
								? "Invalid Date"
								: value.toISOString().replace(/^([\d-]+)T([\d:.]+)(.*)$/, '$1 $2 $3')
						];
					}
					else if (value instanceof HTMLElement) {
						return this._generateValueBriefViewHTMLElement(value);
					}
					else if (value instanceof Promise) {
						return this._generateValueBriefViewPromise(value);
					}
					else {
						return this._generateValueBriefViewObject(value);
					}
				}
				else if (ivType === 'function') {
					return this._generateValueBriefViewFunction(value);
				}
				return undefined;
			}
			
			static _generateValueBriefViewPromise(value) {
				const done = new ValueWrapper(new InfoText("Pending\u2026"));
				value
					.then(() => done.set(new InfoText("Resolved")))
					.catch(() => done.set(new InfoText("Error")))
				;
				const el = this.create(done);
				el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 100 100"><circle cx="50" cy="50" r="37" stroke-width="21" stroke="currentColor" stroke-dasharray="58.119464091411174 58.119464091411174" fill="none" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="2s" keyTimes="0;1" values="0 50 50;360 50 50"></animateTransform></circle></svg>`;
				return [el];
			}
			
			static _generateValueBriefViewFunction(value) {
				let res = '';
				const m = /^[^\(]*\((.*)\)\s*(?:\{|=>)/.exec(value);
				let params = (!m ? '' : m[1]).trim();
				try {
					if (!params && value.length) {
						params = value.length > 26 ? '\u2026' : new Array(value.length)
							.fill('')
							.map((v, i) => String.fromCharCode(97 + i))
							.join(', ')
						;
					}
				}
				catch {}
				res += `(${params})`;
				return [res];
			}
			
			static _generateValueBriefViewArray(value) {
				let res = document.createElement('div');
				let prevI = -1;
				let emptyCounter = 0;
				for (const i in value) {
					if (res.childNodes.length > 0) {
						res.appendChild(document.createTextNode(", "));
					}
					if (res.textContent.length > 150) {
						res.appendChild(document.createTextNode("\u2026"));
						break;
					}
					if (Number.isInteger(+i)) {
						if (i - prevI > 1) {
							emptyCounter += i - prevI - 1;
						}
						prevI = i;
					}
					if (emptyCounter) {
						res.appendChild(document.createTextNode(`${emptyCounter} empty, `));
						emptyCounter = 0;
					}
					let elIv;
					if (Number.isInteger(+i)) {
						elIv = this.createSimple(value[i]);
					}
					else {
						elIv = this.createSimple(value[i], i);
					}
					res.appendChild(elIv);
				}
				res.insertBefore(document.createTextNode("["), res.childNodes[0]);
				res.appendChild(document.createTextNode("]"));
				return Array.from(res.childNodes);
			}
			
			static _generateValueBriefViewObject(value) {
				let res = document.createElement('div');
				for (const k in value) {
					if (res.childNodes.length > 0) {
						res.appendChild(document.createTextNode(", "));
					}
					if (res.textContent.length > 150) {
						res.appendChild(document.createTextNode("\u2026"));
						break;
					}
					const elIv = this.createSimple(value[k], k);
					res.appendChild(elIv);
				}
				res.insertBefore(document.createTextNode("{"), res.childNodes[0]);
				res.appendChild(document.createTextNode("}"));
				return Array.from(res.childNodes);
			}
			
			static _generateValueBriefViewHTMLElement(value) {
				try {
					let res = value.cloneNode().outerHTML;
					res = res.replace(/<\/[^>]+>$/, '');
					return [res];
				}
				catch (err) {
					return [];
				}
			}
			
			static *_getDescriptors(obj0, includeExtra, uniqueNames) {
				if (includeExtra) {
					try {
						yield* this._getDescriptorsExtra(obj0);
					}
					catch (err) {
						let knownError = false;
						knownError = knownError || err.message === `Function.prototype.toString requires that 'this' be a Function`;
						if (!knownError) {
							console.warn(err);
						}
					}
				}
				const allNames = !uniqueNames ? null : new Set();
				
				for (let obj = obj0, level = 0; obj !== null; obj = Object.getPrototypeOf(obj), level++) {
					let descriptors = Object.getOwnPropertyDescriptors(obj);
					let keys = Object.getOwnPropertyNames(obj)
						.concat(Object.getOwnPropertySymbols(obj))
					;
					for (const k of keys) {
						if (allNames) {
							if (allNames.has(k)) {
								continue;
							}
							allNames.add(k);
						}
						const descriptor = descriptors[k];
						descriptor.name = k;
						descriptor.level = level;
						descriptor.inherited = obj != obj0;
						yield descriptor;
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
