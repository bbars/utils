# JS: LoopedArray

Fast limited list implementation. Usage example: manage large and frequently updated series data.

```html
<script src="looped-array.js"></script>
<script>
var a = new LoopedArray(5);

for (var i = 0; i < 100000; i++) {
  a.push({ i: i, value: Math.round(Math.random() * 100) });
}
</script>
```

Resulting `a.toArray()`:
```js
[
  { i: 99995, value: 44 },
  { i: 99996, value: 18 },
  { i: 99997, value: 21 },
  { i: 99998, value: 66 },
  { i: 99999, value: 35 }
]
```

### Iterator example
```js
var item, iterator = a.getIterator();
while (item = iterator.next()) {
	console.log(item.index, item.cursor, item.position, item.value);
}
```
