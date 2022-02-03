const _globalThis = typeof globalThis === 'object' ? globalThis : this;

export default class JSONSchema {
	_tree;
	
	constructor(tree) {
		this._tree = tree;
	}
	
	parse(json) {
		return this.make(JSON.parse(json));
	}
	
	make(data) {
		return this.constructor.make(this._tree, data);
	}
	
	static parse(tree, json) {
		return new this(tree).parse(json);
	}
	
	static make(tree, data) {
		if (typeof tree === 'function' && typeof tree.getJSONSchema === 'function') {
			tree = tree.getJSONSchema();
		}
		if (tree instanceof JSONSchema) {
			tree = tree._tree;
		}
		const treeType = typeof tree;
		if (tree === undefined || tree === 'any') {
			return data;
		}
		else if (tree === 'string') {
			return typeof data === 'undefined' ? '' : '' + data;
		}
		else if (tree === 'number') {
			return +data;
		}
		else if (tree === 'boolean') {
			return !!(isNaN(data) ? data : +data);
		}
		else if (tree === 'bigint') {
			return BigInt(data);
		}
		else if (tree instanceof Array || tree === Array) {
			const res = tree === Array || tree.constructor === Array
				? new Array(data ? data.length : 0)
				: Object.create(tree.prototype)
			;
			if (data === undefined) {
				return res;
			}
			return this._fillArray(res, tree, data);
		}
		else if (treeType === 'function') {
			return this._instantiate(tree, data);
		}
		else if (tree instanceof JSONSchemaMix) {
			return tree.make(data);
		}
		else if (treeType === 'object') {
			return this._fillObject({}, tree, data);
		}
		else {
			throw new Error(`Unsupported type: '${tree}'`);
		}
	}
	
	static _instantiate(constructor, data) {
		if (data == null) {
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
	
	static _fillArray(arr, tree, data) {
		if (!(data instanceof Array)) {
			throw new Error("Data should be an array");
		}
		let leaf = undefined;
		for (let i = 0; i < data.length; i++) {
			if (tree.length > i) {
				leaf = tree[i];
			}
			arr[i] = this.make(leaf, data[i]);
		}
		return arr;
	}
	
	static _fillObject(obj, tree, data, names) {
		if (typeof data !== 'object') {
			throw new Error("Data should be an object");
		}
		if (!names) {
			names = Object.keys(data);
		}
		for (const name of names) {
			obj[name] = this.make(tree[name], data[name]);
		}
		return obj;
	}
	
	static mix(constructor, propsObject) {
		return new JSONSchemaMix(constructor, propsObject);
	}
	
	toJSON() {
		const converter = (data, path) => {
			if (typeof data === 'function') {
				return {
					type: 'constructor',
					name: data.name,
				};
			}
			else if (data instanceof JSONSchemaMix) {
				return {
					type: 'mix',
					name: data.underlyingConstructor.name,
					propsObject: converter(data.propsObject, path.concat(['propsObject'])),
				};
			}
			else if (data instanceof Array) {
				const res = new Array(data.length);
				for (const i in data) {
					res[i] = converter(data[i], path.concat([i]));
				}
				return res;
			}
			else if (typeof data === 'object' && data !== null) {
				const value = {};
				for (const k in data) {
					value[k] = converter(data[k], path.concat([k]));
				}
				return {
					type: 'object',
					name: data.constructor.name,
					value: value,
				};
			}
			else {
				return data;
			}
		};
		return converter(this._tree, []);
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
				return this.resolveConstructor(data.name) || Object;
			}
			else if (data.type === 'mix') {
				const underlyingConstructor = this.resolveConstructor(data.name) || Object;
				const propsObject = converter(data.propsObject, path.concat(['propsObject']));
				return new JSONSchemaMix(underlyingConstructor, propsObject);
			}
			else if (data.type === 'object') {
				const constructor = this.resolveConstructor(data.name) || Object;
				const res = constructor === Array ? [] : Object.create(data.constructor.prototype);
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

class JSONSchemaMix {
	underlyingConstructor;
	propsObject;
	
	constructor(underlyingConstructor, propsObject) {
		this.underlyingConstructor = underlyingConstructor;
		this.propsObject = propsObject;
	}
	
	make(data) {
		const res = JSONSchema._instantiate(this.underlyingConstructor, data);
		if (res == null) {
			return res;
		}
		const names = res.constructor === Object
			? undefined
			: Object.keys(this.propsObject)
		;
		JSONSchema._fillObject(res, this.propsObject, data, names);
		return res;
	}
}

JSON.Schema = JSONSchema;
