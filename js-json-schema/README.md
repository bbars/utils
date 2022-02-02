# JSONSchema

Utility lib to convert raw JSON.parse output to declared types.

## Examples

### Primitives
```js
new JSONSchema('string').parse('"foo"');
// Result: string primitive "foo" (there's no magic)

new JSONSchema('boolean').parse('1');
// Result: boolean true
// (primitive numeric value 1 converted to boolean true)

new JSONSchema('boolean').parse('"0"');
// Result: boolean false
// (primitive string value "0" converted to boolean false)
```

### Arrays
```js
new JSONSchema(['string']).parse('[1, "2", 3]');
// Result: Array ["1", "2", "3"]
// (all elements of array are primitive strings)
```

### Objects
```js
var schema = new JSONSchema({
    str: 'string',
    num: 'number',
    bool: 'boolean',
    arr: ['number'],
    foo: {
        bar: 'string',
    },
    StringClass: String,
    ololo: 'string', // object props are optional
});
schema.parse(JSON.stringify({
    str: 1234, // converts to string '1234'
    num: '5678', // converts to number 5678
    bool: 90, // converts to true
    arr: [1, '2', 3], // converts to an array of numbers
    foo: { // converts to sub-object
        bar: 'baz', // converts to string
    },
    StringClass: 'not primitive', // converts to a String object
    // ololo: '', // skip
}));
/* Result: Object {
    str: '1234',
    num: 5678,
    bool: true,
    StringClass: String {'not primitive'}
} */
```

### Tuples
```js
var schema = new JSONSchema([
    'string',
    'boolean',
    'number',
]);
schema.parse(JSON.stringify([
    0, // becomes string '0'
    1, // becomes boolean true
    '2', // this and the rest of elements become numbers
    3,
    4,
]));
/* Result: [
    '0',
    true,
    2,
    3,
    4,
] */
```

### Classes
```js
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Magic method, called by JSON.stringify
     */
    toJSON() {
        return [this.x, this.y]; // return array
    }
    
    /**
     * Magic method, called by JSONSchema
     */
    static fromJSON(data) {
        // assuming, that data is array [x, y]
        return new this(data[0], data[1]);
    }
}

var point = new Point(4, 9); // Point { x: 4, y: 9 }
var json = JSON.stringify(point); // [4, 9]
var schema = new JSONSchema(Point);
schema.parse(json);
/* Result: Point {
    x: 4,
    y: 9,
} */
```

#### Class with extra properties

If your object is an instance of known class, but has extra properties, you can use JSONSchema.mix:
```js
class Rect {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    
    static fromJSON(data) {
        return new this(JSONSchema.make(Point, data.p0), JSONSchema.make(Point, data.p1));
    }
}

var rect = new Rect(new Point(0, 0), new Point(5, 6));
rect.clickable = true;
var json = JSON.stringify(rect); // {"p0": [0,0], "p1": [5,6], "clickable": true}

new JSONSchema(Rect).parse(json); // property 'clickable' lost :(

// But...
var schema = new JSONSchema(JSONSchema.mix(Rect, {
    clickable: 'boolean', // declare extra property
}));
schema.parse(json);
/* Result: Rect {
    p0: Point {
        x: 0,
        y: 0,
    },
    p1: Point {
        x: 5,
        y: 6,
    },
    clickable: true, <-- here it is!
} */
```
