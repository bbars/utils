# JSONSchema

Utility lib to convert raw JSON.parse output to declared types.

## Usage

There are two ways how JSONSchema can be imported and used.

Global:
```html
<script type="module" src="./JSONSchema.js"></script>
<script>

let schema = new JSON.Schema({ ... });

</script>
```

Within a module:
```html
<script type="module">

import JSONSchema from './JSONSchema.js';
let schema = new JSONSchema({ ... });

</script>
```

### Static functions

#### JSONSchema.prototype.constructor(tree)

Create an instance of JSONSchema storing `tree` within private property `this._tree`. This object can be safely converted to a JSON if you want to transfer schema itself: `JSON.stringify(new JSONSchema(Boolean))`.

#### JSONSchema.prototype.make(data)

Process and convert values of `data` to types according to declarations in `this._tree`.

#### JSONSchema.prototype.parse(json)

Parse string value `json` and invoke `JSONSchema.prototype.make` internally.

#### static JSONSchema.make(tree, data)

There's no need to instantiate a JSONSchema when you dont need it. You can just call this static alternative function to convert values of `data` to types according to declarations in `tree`.

#### static JSONSchema.parse(tree, json)

There's no need to instantiate a JSONSchema when you dont need it. You can just call this static alternative function to parse `json` and convert its values to types according to declarations in `tree`.

## Examples

### Primitives
```js
JSONSchema.parse('string', '"foo"');
// Result: string primitive "foo" (there's no magic)

new JSONSchema('string').parse('"foo"');
// Same as previous

JSONSchema.parse('boolean', '1');
// Result: boolean true
// (primitive numeric value 1 converted to boolean true)

JSONSchema.parse('boolean', '"0"');
// Result: boolean false
// (primitive string value "0" converted to boolean false)

JSONSchema.parse('bigint', '"9007199254740993"');
// Result: bigint 9007199254740993n
// (primitive string value "9007199254740993" converted to bigint)
```

#### Converting bigint values

If you need BigInt -> JSON conversion, you should implement your own BigInt.toJSON method first:
```js
BigInt.prototype.toJSON = function () { return this.toString(10); };
```

Now bigint values can be safely converted to and from JSON:
```js
JSON.stringify(1234n); // -> "1234"
JSON.stringify(Object(5678n)); // -> "5678"
JSONSchema.make('bigint', '9007199254740993'); // -> 9007199254740993n
var n = JSONSchema.make(BigInt, '9007199254740993'); // -> BigInt {9007199254740993n}
JSON.stringify({ n: n }); // -> { "n": "9007199254740993" }
```

### Arrays
```js
JSONSchema.parse(['string'], '[1, "2", 3]');
// Result: Array ["1", "2", "3"]
// (all elements of array are primitive strings)

JSONSchema.parse([['number']], '[[1, "2", 3], [4, 5, 6], [7, 8, 9]]'); // 3x3 matrix
// Result: Array [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
// (all elements of nested arrays are primitive numbers)

JSONSchema.parse({ 2: 'string' }, '[0, "1", 2]');
// Result: Object { 0: 0, 1: '1', 2: '2' }
// (array converted to an object;
// value of prop '2' converted to string,
// while the rest left as they were)
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
    BigInt: BigInt,
    ololo: 'string', // object props are optional
});
schema.make({
    str: 1234, // becomes string '1234'
    num: '5678', // becomes number 5678
    bool: 90, // becomes true
    arr: [1, '2', 3], // becomes an array of numbers
    foo: { // becomes a sub-object
        bar: 'baz', // becomes a primitive string
    },
    StringClass: 'not primitive', // becomes a String object
    BigInt: '9007199254740993', // becomes a BigInt object
    // ololo: '', // skip
});
/* Result: Object {
    str: '1234',
    num: 5678,
    bool: true,
    arr: [1, 2, 3],
    foo: {
        bar: 'baz',
    },
    StringClass: String {'not primitive'},
    BigInt: BigInt {'9007199254740993'],
} */
```

### Tuples
```js
var schema = new JSONSchema([
    'string',
    'boolean',
    'number',
]);
schema.make([
    0, // becomes string '0'
    1, // becomes boolean true
    '2', // this and the rest of elements become numbers
    3,
    4,
]);
/* Result: Array [
    '0',
    true,
    2,
    3,
    4
] */
```

### Classes
```js
// some-geometry-library.js
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

// index.js
import { Point } from 'some-geometry-library';

var point = new Point(4, 9); // Point { x: 4, y: 9 }
var json = JSON.stringify(point); // [4, 9]
var schema = new JSONSchema(Point);
schema.parse(json);
/* Result: Point {
    x: 4,
    y: 9
} */
```

#### Class with extra properties

If the object is an instance of known class, but has extra properties, you can use JSONSchema.mix:
```js
// some-geometry-library.js
class Rect {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    
    static fromJSON(data) {
        return new this(JSONSchema.make(Point, data.p0), JSONSchema.make(Point, data.p1));
    }
}

// index.js
import { Rect, Point } from 'some-geometry-library';
var rect = new Rect(new Point(0, 0), new Point(5, 6));

// define extra property:
rect.clickable = true;

var json = JSON.stringify(rect); // {"p0": [0,0], "p1": [5,6], "clickable": true}

JSONSchema.parse(Rect, json); // property 'clickable' is lost :(

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
    clickable: true <-- here it is!
} */
```

## Stringify JSONSchema itself

JSONSchema class can be safely stringified as JSON:

```js
import { Rect } from 'some-geometry-library';

var schema = new JSONSchema({
    str: 'string',
    arr: ['number'],
    foo: {
        bar: 'string',
    },
    StringClass: String,
    BigInt: BigInt,
    
    rect: Rect, // custom imported class
});

var json = JSON.stringify(schema, null, '  ');
/* Result: string `{
  "type": "object",
  "name": "Object",
  "value": {
    "str": "string",
    "arr": [
      "number"
    ],
    "foo": {
      "type": "object",
      "name": "Object",
      "value": {
        "bar": "string"
      }
    },
    "StringClass": {
      "type": "constructor",
      "name": "String"
    },
    "BigInt": {
      "type": "constructor",
      "name": "BigInt"
    },
    "rect": {
      "type": "constructor",
      "name": "Rect"
    }
  }
}` */
```

Now it can be thansferred for example from server to client and recomposed to live JSONSchema:

```js
JSONSchema.parse(JSONSchema, json);
/* Result: JSONSchema {
    _tree: {
        ...
        ...
        rect: f Object() <-- WAT???
    }
} */
```

Type of property 'rect' is wrong now. That's because the other environment doesn't know a custom class named 'Rect'. But there's a workaround. The one should re-implement static method `JSONSchema.resolveConstructor`.

### Implement custom JSONSchema.resolveConstructor

```js
import { Point, Rect } from 'some-geometry-library';

// You should define a way to resolve constructors
// from its names:
JSONSchema.resolveConstructor = (name) => {
    if (name === 'Point') {
        // Since class Point is not exported to window.*,
        // we should pass its constructor from current scope
        return Point;
    }
    if (name === 'Rect') {
        // Since class Rect is not exported to window.*,
        // we should pass its constructor from current scope
        return Rect;
    }
    return window[name];
};

var schema = JSONSchema.parse(JSONSchema, json);
/* Result: JSONSchema {
    _tree: {
        ...
        ...
        rect: class Rect <-- It's okay now
    }
} */

var res = schema.parse('{ ... "rect": { "p0": [0,0], "p1": [5,6] } }');
/* Value of res.rect: Rect {
    p0: Point {
        x: 0,
        y: 0,
    },
    p1: Point {
        x: 5,
        y: 6,
    },
} */
```

### Implement magic static method CustomClass.getJSONSchema

It is possible to over-declare schema of specific class. For example, you can declare a JSONSchema.mix:

```js
// some-geometry-library.js
class Rect {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    
    static fromJSON(data) {
        return new this(JSONSchema.make(Point, data.p0), JSONSchema.make(Point, data.p1));
    }
    
    static getJSONSchema() {
        return JSONSchema.mix(this, {
            clickable: 'boolean', // declare extra property
        });
    }
}

// index.js

import { Rect, Point } from 'some-geometry-library';

// There's no need to declare JSONSchema.mix outside anymore:
var schema = new JSONSchema(Rect);

var rect = new Rect(new Point(0, 0), new Point(5, 6));
// define extra property:
rect.clickable = true;

var json = JSON.stringify(rect); // {"p0": [0,0], "p1": [5,6], "clickable": true}

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
    clickable: true <-- here it is!
} */
```

Another example (don't do it IRL): you can make all instances of Number to be converted to primitive numbers:

```js
var json = JSON.stringify(1234); // string '1234'
var parsedRaw = JSON.parse(json); // number 1234

JSONSchema.parse(Number, json);
// Result: Number {1234}

Number.getJSONSchema = () => 'number'; // the magic is here

JSONSchema.parse(Number, json);
// Result: number 1234
// (because JSONSchema has called Number.getJSONSchema
// and got updated schema for an instance:
// primitive number instead of Number class)
```
