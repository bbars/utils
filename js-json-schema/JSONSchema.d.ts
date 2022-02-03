type Class<T = Object> = new (...args: any[]) => T;
type PrimitiveTypes = 'string' | 'number' | 'boolean' | 'bigint';
type PrimitiveObjectiveTypes = typeof String | typeof Number | typeof Boolean | typeof BigInt;
type AllTypes = PrimitiveTypes | PrimitiveObjectiveTypes | Class | JSONSchemaMix | TypeObject | TypeArray;
type TypeObject = { [key: string]: AllTypes };
type TypeArray = AllTypes[];

type PrimitiveValues = string | number | boolean | bigint;
type PrimitiveObjectiveValues = String | Number | Boolean | BigInt;
type AnyValue = PrimitiveValues | PrimitiveObjectiveValues | AnyObject | AnyArray;
type AnyObject = { [key: string]: AnyValue };
type AnyArray = AnyValue[];

type JSONString = string;

export default class JSONSchema {
    constructor(tree: AllTypes);
    make(data: AnyObject): AnyValue; 
    parse(json: JSONString): AnyValue; 
    static make(tree: AllTypes, data: AnyObject): AnyValue; 
    static parse(tree: AllTypes, json: JSONString): AnyValue; 
    static mix(constructor: Class, propsObject: TypeObject): JSONSchemaMix;
}

interface JSONSchemaMix {
	underlyingConstructor: Class;
	propsObject: AnyObject;
	
	new(underlyingConstructor: Class, propsObject: TypeObject);
    make(data: AnyObject): AnyObject;
}
