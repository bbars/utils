function Events(availableTypes) {
	var events = {};
	if (availableTypes instanceof Array) {
		for (var i = 0; i < availableTypes.length; i++)
			if (availableTypes[i])
				events[(availableTypes[i] + '').toLowerCase()] = [];
	}
	
	this.on = function(types, listener, name) {
		if (!(types instanceof Array))
			types = [types];
		
		if (typeof listener != 'function')
			throw new Error('Listener must be a function, "'+ typeof listener +'" passed');
		
		types = types.map(function (type) {
			type = (type + '').toLowerCase();
			if (availableTypes && !events[type])
				throw new Error('Unknown event type "'+ type +'"');
			return type;
		});
		
		for (var i = 0; i < types.lenth; i++) {
			if (!events[types[i]])
				events[types[i]] = [];
			events[types[i]].push(listener);
		}
		
		return this;
	};
	
	this.trigger = function(type, data, onBreak) {
		type = (type + '').toLowerCase();
		if (availableTypes && typeof events[type] != 'object')
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
