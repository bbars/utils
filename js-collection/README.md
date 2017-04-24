Interact with linear collections.

## Create collection

	// new collection from array:
	var c = new Collection([
		{ str: 'foo',       num: 2,		numPow: numPow },
		{ str: 'foobar',    num: 4,		numPow: numPow },
		{ str: 'foobar',    num: 8,		numPow: numPow },
		{ str: 'baz',       num: 16,	numPow: numPow },
	]);
	
	// sample function:
	function numPow(exponent) {
		return Math.pow(this.num, exponent);
	}

## Filter collection

	// property 'str' equals "foobar":
	var c1 = c.filter('str=foobar');
	
	// or property 'num' greater or equals 8:
	var c2 = c.filter('num>=8');
	
	// or property 'str' matches /^.oO/i:
	var c3 = c.filter('str*=/^.oO/i');
	
Available comparison operators:

1. `=` or `==`: `property=foo` — equals `"foo"`;
2. `!=`: `property!=foobaz` — doesn't equal `"foobaz"`;
3. `>` and `>=`: `property>=8` — greater than or equal to `"8"`;
4. `<` and `<=`: `property<8` — less than `"8"`;
5. `*=`: `property*=/Reg.xp/i` — test RegExp `/Reg.xp/i`.

Also you can pass custom comparison function:
	
	function comparator(item) {
		return item.num >= 4 && item.num <= 8;
	}
	var c4 = c.filter(comparator);

## Call or apply methods

	var c2pow2 = c.filter('num>=8').call('numPow', 2);	// > [ 64, 256 ]
	
	// or:
	var c2pow2 = c.filter('num>=8').call(function (exponent) { return Math.pow(this.num, exponent) }, 2));
	
	// or:
	var args = [ 2 ];
	var c2pow2 = c.filter('num>=8').apply('numPow', args);	// > [ 64, 256 ]

## Get and set properties

	var c1 = c.filter('str=foobar');
	c1.get('num'); // > [ 4, 8 ]
	
	c1 = c.filter('str=foobar');
	c1.set('num', 256);

## Parent Collection link

	var c1 = c.filter('str=foobar');
	c1.parent === c; // > true

If you want to prevent Collection from storing link to parents, pass `false` as a second argument to constructor:

	var c = new Collection([ ... ], false);
	c.filter('str=foobar').parent; // > false

## All at once

	// new collection from array:
	var c = new Collection([
		{ str: 'foo',       num: 2,		numPow: numPow }, // #0
		{ str: 'foobar',    num: 4,		numPow: numPow }, // #1
		{ str: 'foobar',    num: 8,		numPow: numPow }, // #2
		{ str: 'baz',       num: 16,	numPow: numPow }, // #3
	]);
	
	c	.filter('str*=/^(foo)?ba[rz]$/') // contains only #1, #2, #3
		.set('num', 128) // set theirs 'num' properties to 128 
		.parent // back to parent Collection which contains all of 4 elements
		.get('num'); // > [ 2, 128, 128, 128 ]
