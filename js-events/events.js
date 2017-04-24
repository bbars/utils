function Events(types) {
	var events = {};
	if (typeof types == 'object' && types instanceof Array)
		for (var i = 0; i < types.length; i++)
			if (types[i])
				events[(types[i] + '').toLowerCase()] = [];
	
	this.on = function(type, listener, name) {
		type = (type + '').toLowerCase();
		if (types && !events[type])
			throw new Error('Unknown event type "'+ type +'"');
		
		if (!events[type])
			events[type] = [];
		
		if (typeof listener != 'function')
			throw new Error('Listener must be a function, "'+ typeof listener +'" passed');
		
		events[type].push(listener);
		
		return this;
	};
	
	this.trigger = function(type, data, onBreak) {
		type = (type + '').toLowerCase();
		if (types && typeof events[type] != 'object')
			throw new Error('Unknown event type "'+ type +'"');
		else if (typeof events[type] != 'object')
			return undefined;
		
		var event = {
			type: type,
		};
		if (data && typeof data == 'object') {
			for (var k in data)
				event[k] = data[k];
		}
		
		for (var i = 0; i < events[type].length; i++) {
			if (events[type][i].call(this, event, i) === false) {
				if (onBreak && typeof onBreak == 'function')
					onBreak.call(this, event, i);
				return this;
			}
		}
		
		return this;
	};
}
