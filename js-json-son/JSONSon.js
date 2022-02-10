const _globalThis = typeof globalThis === 'object' ? globalThis : this;

export default class JSONSon {
	_type;
	
	constructor(type) {
		this._type = type;
	}
	
	parse(json) {
		return this.make(JSON.parse(json));
	}
	
	make(data) {
		return this.constructor.make(this._type, data);
	}
	
	static parse(type, json) {
		return new this(type).parse(json);
	}
	
	static make(type, data) {
		if (typeof type === 'function' && typeof type.getJSONSonSchema === 'function') {
			type = type.getJSONSonSchema();
		}
		if (type instanceof JSONSon) {
			type = type._type;
		}
		const typeType = typeof type;
		if (type === undefined || type === 'any') {
			return data;
		}
		else if (type === 'string') {
			return typeof data === 'undefined' ? '' : '' + data;
		}
		else if (type === 'number') {
			return +data;
		}
		else if (type === 'boolean') {
			return !!(isNaN(data) ? data : +data);
		}
		else if (type === 'bigint') {
			return BigInt(data);
		}
		else if (type instanceof Array || type === Array) {
			const res = type === Array || type.constructor === Array
				? new Array(data ? data.length : 0)
				: Object.create(type.prototype)
			;
			if (data === undefined) {
				return res;
			}
			return this._fillArray(res, type, data);
		}
		else if (typeType === 'function') {
			return this._instantiate(type, data);
		}
		else if (type instanceof JSONSonInternal) {
			return type.make(data);
		}
		else if (typeType === 'object') {
			return this._fillObject({}, type, data);
		}
		else {
			throw new Error(`Unsupported type: '${type}'`);
		}
	}
	
	static _instantiate(constructor, data, force) {
		if (data == null && !force) {
			return data;
		}
		if (constructor === BigInt) {
			return Object(BigInt(data));
		}
		let res = constructor.fromJSON ? constructor.fromJSON(data) : new constructor(data);
		if (!res.constructor || res.constructor.name === 'Object') {
			const temp = res;
			res = Object.create(constructor.prototype);
			for (const name in temp) {
				res[name] = temp[name];
			}
		}
		return res;
	}
	
	static _fillArray(arr, type, data) {
		if (!(data instanceof Array)) {
			throw new Error("Data should be an array");
		}
		let leaf = undefined;
		for (let i = 0; i < data.length; i++) {
			if (type.length > i) {
				leaf = type[i];
			}
			arr[i] = this.make(leaf, data[i]);
		}
		return arr;
	}
	
	static _fillObject(obj, type, data, names) {
		if (typeof data !== 'object') {
			throw new Error("Data should be an object");
		}
		if (!names) {
			names = Object.keys(data);
		}
		for (const name of names) {
			obj[name] = this.make(type[name], data[name]);
		}
		return obj;
	}
	
	static mix(constructor, propsObject) {
		return new JSONSonMix(constructor, propsObject);
	}
	
	static enum(...supportedValues) {
		return new JSONSonEnum(...supportedValues);
	}
	
	toJSON() {
		const converter = (data, path) => {
			if (typeof data === 'function') {
				return {
					type: 'constructor',
					name: data.name,
				};
			}
			else if (data instanceof Array) {
				const res = new Array(data.length);
				for (const i in data) {
					res[i] = converter(data[i], path.concat([i]));
				}
				return res;
			}
			else if (data instanceof JSONSonInternal) {
				return {
					type: 'internal',
					name: data.constructor.name,
					value: data,
				};
			}
			else if (typeof data === 'object' && data !== null) {
				const value = {};
				for (const k in data) {
					value[k] = converter(data[k], path.concat([k]));
				}
				return {
					type: 'object',
					name: data.constructor.name !== 'Object' ? data.constructor.name : undefined,
					value: value,
				};
			}
			else {
				return data;
			}
		};
		return converter(this._type, []);
	}
	
	static fromJSON(data) {
		const converter = (data, path) => {
			if (typeof data !== 'object' || data == null) {
				return data;
			}
			else if (data instanceof Array) {
				const res = new Array(data.length);
				for (const i in data) {
					res[i] = converter(data[i], path.concat([i]));
				}
				return res;
			}
			else if (data.type === 'constructor') {
				const res = this.resolveConstructor(data.name);
				if (!res) {
					throw new Error(`Unable to resolve constructor '${data.name}'`);
				}
				return res;
			}
			else if (data.type === 'internal') {
				const constructor = JSONSonInternal.implementations[data.name];
				if (!constructor) {
					throw new Error(`Unknown type: '${data.name}'. Please check if you are using compatible JSONSon version`);
				}
				return this._instantiate(constructor, data.value);
			}
			else if (data.type === 'object') {
				const constructor = this.resolveConstructor(data.name || 'Object') || Object;
				const res = constructor === Array ? [] : Object.create(constructor.prototype);
				for (const k in data.value) {
					res[k] = converter(data.value[k], path.concat(['value', k]));
				}
				return res;
			}
			
			const pathStr = ['$'].concat(path).join('.');
			throw new Error(`Invalid value at '${pathStr}'`);
		};
		return new this(converter(data, []));
	}
	
	static resolveConstructor(name) {
		return _globalThis[name];
	}
}

class JSONSonInternal {
	static implementations = {};
}

class JSONSonMix extends JSONSonInternal {
	underlyingConstructor;
	propsObject;
	
	constructor(underlyingConstructor, propsObject) {
		super();
		this.underlyingConstructor = underlyingConstructor;
		this.propsObject = propsObject;
	}
	
	make(data) {
		const res = JSONSon._instantiate(this.underlyingConstructor, data);
		if (res == null) {
			return res;
		}
		const names = res.constructor === Object
			? undefined
			: Object.keys(this.propsObject)
		;
		JSONSon._fillObject(res, this.propsObject, data, names);
		return res;
	}
	
	toJSON() {
		return {
			underlyingConstructor: this.underlyingConstructor.name,
			propsObject: new JSONSon(this.propsObject),
		};
	}
	
	static fromJSON(data) {
		const underlyingConstructor = JSONSon.resolveConstructor(data.underlyingConstructor);
		if (!underlyingConstructor) {
			throw new Error(`Unable to resolve constructor '${data.underlyingConstructor}'`);
		}
		const propsObject = JSONSon.fromJSON(data.propsObject)._type;
		return new this(underlyingConstructor, propsObject);
	}
}
JSONSonInternal.implementations['JSONSonMix'] = JSONSonMix;

class JSONSonEnum extends JSONSonInternal {
	supportedValues = new Set();
	
	constructor(...supportedValues) {
		super();
		supportedValues.forEach((v) => this.supportedValues.add(v));
	}
	
	make(data) {
		if (!this.supportedValues.has(data)) {
			throw new Error(`Unknown enum value: ${data}`);
		}
		return data;
	}
	
	toJSON() {
		return {
			supportedValues: Array.from(this.supportedValues),
		};
	}
	
	static fromJSON(data) {
		return new this(...data.supportedValues);
	}
}
JSONSonInternal.implementations['JSONSonEnum'] = JSONSonEnum;

JSON.Son = JSONSon;
