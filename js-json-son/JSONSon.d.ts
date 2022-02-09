type Class<T = Object> = new (...args: any[]) => T;
type PrimitiveTypes = 'string' | 'number' | 'boolean' | 'bigint';
type PrimitiveObjectiveTypes = typeof String | typeof Number | typeof Boolean | typeof BigInt;
type AllTypes = PrimitiveTypes | PrimitiveObjectiveTypes | Class | JSONSonMix | TypeObject | TypeArray;
type TypeObject = { [key: string]: AllTypes };
type TypeArray = AllTypes[];

type PrimitiveValues = string | number | boolean | bigint;
type PrimitiveObjectiveValues = String | Number | Boolean | BigInt;
type AnyValue = PrimitiveValues | PrimitiveObjectiveValues | AnyObject | AnyArray;
type AnyObject = { [key: string]: AnyValue };
type AnyArray = AnyValue[];

type JSONString = string;

export default class JSONSon {
	constructor(type: AllTypes);
	make(data: AnyObject): AnyValue; 
	parse(json: JSONString): AnyValue; 
	static make(type: AllTypes, data: AnyObject): AnyValue; 
	static parse(type: AllTypes, json: JSONString): AnyValue; 
	static mix(constructor: Class, propsObject: TypeObject): JSONSonMix;
}

interface JSONSonMix {
	underlyingConstructor: Class;
	propsObject: AnyObject;
	
	new(underlyingConstructor: Class, propsObject: TypeObject);
	make(data: AnyObject): AnyObject;
}
