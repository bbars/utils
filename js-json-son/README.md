# JSONSon

Utility lib to convert raw JSON.parse output to declared types.

## Usage

There are two ways how JSONSon can be imported and used.

Global:
```html
<script type="module" src="./JSONSon.js"></script>
<script>

let schema = new JSON.Son({ ... });

</script>
```

Within a module:
```html
<script type="module">

import JSONSon from './JSONSon.js';
let schema = new JSONSon({ ... });

</script>
```

### Static functions

#### JSONSon.prototype.constructor(type)

Create an instance of JSONSon storing `type` within private property `this._type`. This object can be safely converted to a JSON if you want to transfer schema itself: `JSON.stringify(new JSONSon(Boolean))`.

#### JSONSon.prototype.make(data)

Process and convert values of `data` to types according to declarations in `this._type`.

#### JSONSon.prototype.parse(json)

Parse string value `json` and invoke `JSONSon.prototype.make` internally.

#### static JSONSon.make(type, data)

There's no need to instantiate a JSONSon when you dont need it. You can just call this static alternative function to convert values of `data` to types according to declarations in `type`.

#### static JSONSon.parse(type, json)

There's no need to instantiate a JSONSon when you dont need it. You can just call this static alternative function to parse `json` and convert its values to types according to declarations in `type`.

## Examples

### Primitives
```js
JSONSon.parse('string', '"foo"');
// Result: string primitive "foo" (there's no magic)

new JSONSon('string').parse('"foo"');
// Same as previous

JSONSon.parse('boolean', '1');
// Result: boolean true
// (primitive numeric value 1 converted to boolean true)

JSONSon.parse('boolean', '"0"');
// Result: boolean false
// (primitive string value "0" converted to boolean false)

JSONSon.parse('bigint', '"9007199254740993"');
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
JSONSon.make('bigint', '9007199254740993'); // -> 9007199254740993n
var n = JSONSon.make(BigInt, '9007199254740993'); // -> BigInt {9007199254740993n}
JSON.stringify({ n: n }); // -> { "n": "9007199254740993" }
```

### Arrays
```js
JSONSon.parse(['string'], '[1, "2", 3]');
// Result: Array ["1", "2", "3"]
// (all elements of array are primitive strings)

JSONSon.parse([['number']], '[[1, "2", 3], [4, 5, 6], [7, 8, 9]]'); // 3x3 matrix
// Result: Array [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
// (all elements of nested arrays are primitive numbers)

JSONSon.parse({ 2: 'string' }, '[0, "1", 2]');
// Result: Object { 0: 0, 1: '1', 2: '2' }
// (array converted to an object;
// value of prop '2' converted to string,
// while the rest left as they were)
```

### Objects
```js
var schema = new JSONSon({
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
var schema = new JSONSon([
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
     * Magic method, called by JSONSon
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
var schema = new JSONSon(Point);
schema.parse(json);
/* Result: Point {
    x: 4,
    y: 9
} */
```

#### Class with extra properties

If the object is an instance of known class, but has extra properties, you can use JSONSon.mix:
```js
// some-geometry-library.js
class Rect {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    
    static fromJSON(data) {
        return new this(JSONSon.make(Point, data.p0), JSONSon.make(Point, data.p1));
    }
}

// index.js
import { Rect, Point } from 'some-geometry-library';
var rect = new Rect(new Point(0, 0), new Point(5, 6));

// define extra property:
rect.clickable = true;

var json = JSON.stringify(rect); // {"p0": [0,0], "p1": [5,6], "clickable": true}

JSONSon.parse(Rect, json); // property 'clickable' is lost :(

// But...
var schema = new JSONSon(JSONSon.mix(Rect, {
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

## Stringify JSONSon itself

JSONSon class can be safely stringified as JSON:

```js
import { Rect } from 'some-geometry-library';

var schema = new JSONSon({
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

Now it can be thansferred for example from server to client and recomposed to live JSONSon:

```js
JSONSon.parse(JSONSon, json);
/* Result: JSONSon {
    _type: {
        ...
        ...
        rect: f Object() <-- WAT???
    }
} */
```

Type of property 'rect' is wrong now. That's because the other environment doesn't know a custom class named 'Rect'. But there's a workaround. The one should re-implement static method `JSONSon.resolveConstructor`.

### Implement custom JSONSon.resolveConstructor

```js
import { Point, Rect } from 'some-geometry-library';

// You should define a way to resolve constructors
// from its names:
JSONSon.resolveConstructor = (name) => {
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

var schema = JSONSon.parse(JSONSon, json);
/* Result: JSONSon {
    _type: {
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

### Implement magic static method CustomClass.getJSONSonSchema

It is possible to over-declare schema of specific class. For example, you can declare a JSONSon.mix:

```js
// some-geometry-library.js
class Rect {
    constructor(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }
    
    static fromJSON(data) {
        return new this(JSONSon.make(Point, data.p0), JSONSon.make(Point, data.p1));
    }
    
    static getJSONSonSchema() {
        return JSONSon.mix(this, {
            clickable: 'boolean', // declare extra property
        });
    }
}

// index.js

import { Rect, Point } from 'some-geometry-library';

// There's no need to declare JSONSon.mix outside anymore:
var schema = new JSONSon(Rect);

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

JSONSon.parse(Number, json);
// Result: Number {1234}

Number.getJSONSonSchema = () => 'number'; // the magic is here

JSONSon.parse(Number, json);
// Result: number 1234
// (because JSONSon has called Number.getJSONSonSchema
// and got updated schema for an instance:
// primitive number instead of Number class)
```

## Known issues

- When some class overrides its schema with `getJSONSonSchema`, it ignored within mix
