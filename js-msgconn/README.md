# MsgConn & RPCConn

`MsgConn` is a wrapper of native messaging mechanism (window.postMessage and onmessage event) to communicate with foreign frames.

`RPCConn` additionally provides exporting and linking of functions.




## Cross-frame messaging with MsgConn

`MsgConn` implements methods to be like Socket.IO.

### Send basic message (beacon):

```js
// at iframe-api.html:
window.addEventListener('click', function (event) {
	server.emit('iframeClicked', event.pageX, event.pageY);
});

// at outer-page.html:
client.on('iframeClicked', function (x, y) {
	console.log('iframe clicked', x, y);
});
```

### Send message with callback (query):

```js
// at iframe-api.html:
server.on('parentClicked', function (outerX, outerY) {
	// do something...
	return 'Okay';
});

// at outer-page.html:
window.addEventListener('click', function (event) {
	client.emit('parentClicked', event.pageX, event.pageY, function (isOkay) {
		console.log("The 'parentClicked' emitted and ack returned:", isOkay);
	});
});
```

More efficient way to do the same thing:

```js
// at iframe-api.html:
server.on('parentClicked', function (parentX, parentY) {
	// do something:
	var isOkay = 'no :(';
	try {
		isOkay = handleParentClick(outerX, outerY);
		return isOkay;
	}
	catch (e) {
		console.warn("Send following error to the parent:", e);
		throw e;
	}
});

// at outer-page.html:
window.addEventListener('click', function (event) {
	client.query('parentClicked', event.pageX, event.pageY)
		.then(function (isOkay) {
			console.log("The 'parentClicked' emitted and ack returned:", isOkay);
		})
		.catch(console.error);
});
```




## Cross-frame function call with RPCConn

`RPCConn` is an extension of `MsgConn` to make remote function calls more obvious.

### Example

http:// **foreign.domain.com** /iframe-api.html

```html
<script src="msgconn.js"></script>
<script>

function hello(name) {
	console.log('hello() called with arguments', arguments);
	return 'Hello, ' + name;
}

function testThrow() {
	console.log('testThrow() called with arguments', arguments);
	throw new Error('Dummy error');
}

function testPromise(delaySeconds) {
	console.log('testPromise() called with arguments', arguments);
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve('Success! ' + delaySeconds + ' seconds passed');
		}, delaySeconds * 1000);
	});
}

function testReject(delaySeconds) {
	console.log('testReject() called with arguments', arguments);
	return new Promise(function (_, reject) {
		setTimeout(function () {
			reject('Error: ' + delaySeconds + ' seconds passed');
		}, delaySeconds * 1000);
	});
}

var server = new RPCConn(window.parent);

server.exportFunction(hello);
server.exportFunction(testThrow);
server.exportFunction(testPromise);
server.exportFunction(testReject);

</script>
```

http:// **your.domain.com** /outer-page.html
```html
<script src="msgconn.js"></script>
<iframe id="iframe" src="http://foreign.domain.com/iframe-api.html"></iframe>
<p>
	<button onclick="remoteFuncs.hello('World').then(console.log, console.error)">
		hello('World')
	</button>
	
	<button onclick="remoteFuncs.hello('parent window').then(console.log, console.error)">
		hello('parent window')
	</button>
	
	<button onclick="remoteFuncs.testThrow().then(console.log, console.error)">
		testThrow()
	</button>
	
	<button onclick="remoteFuncs.testPromise(2).then(console.log, console.error)">
		testPromise(2)
	</button>
	
	<button onclick="remoteFuncs.testReject(2).then(console.log, console.error)">
		testReject(2)
	</button>
</p>
<script>

var client = new RPCConn(iframe.contentWindow);
var remoteFuncs = {
	hello:       client.linkFunction('hello'),
	testThrow:   client.linkFunction('testThrow'),
	testPromise: client.linkFunction('testPromise'),
	testReject:  client.linkFunction('testReject'),
};

</script>
```

You can call linked functions. Also you may want to call remote functions without linking:

```js
client.callFunction('hello', 'World');
// equivalent to:
client.applyFunction('hello', ['World']);
```

Result will be delivered via the Promise.
