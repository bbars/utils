var locationHelper = (function () {
	function Events(availableTypes) {
		var events = {};
		if (availableTypes instanceof Array) {
			for (var i = 0; i < availableTypes.length; i++)
				if (availableTypes[i])
					events[(availableTypes[i] + '').toLowerCase()] = [];
		}
		
		function normType(type) {
			type = (type + '').toLowerCase();
			if (availableTypes && !events[type])
				throw new Error('Unknown event type "'+ type +'"');
			return type;
		}
		
		this.on = function (types, listener, name) {
			if (!(types instanceof Array))
				types = [types];
			
			if (typeof listener != 'function')
				throw new Error('Listener must be a function, "'+ typeof listener +'" passed');
			
			types = types.map(normType);
			
			for (var i = 0; i < types.length; i++) {
				if (!events[types[i]])
					events[types[i]] = [];
				events[types[i]].push(listener);
			}
			
			return this;
		};
		
		this.off = function (listener, types) {
			if (types && !(types instanceof Array))
				types = [types];
			
			if (!types || !types.length)
				types = false;
			else {
				types = types.map(normType);
			}
			
			for (var type in events) {
				if (types && types.indexOf(type) < 0)
					continue;
				if (!listener)
					events[type] = [];
				else {
					var j = -1;
					while ((j = events[type].indexOf(listener)) > -1) {
						events[type].splice(j, 1);
					}
				}
			}
			
			return this;
		};
		
		this.trigger = function (type, data, onBreak) {
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
	
	function LocationHelper() {
		Events.call(this);
		
		var prevChange = null;
		
		this.on('change', function (event) {
			if (!prevChange || prevChange.parts.path != event.parts.path) {
				this.trigger('change-path', {
					href: event.href,
					parts: event.parts,
					prevPath: prevChange ? prevChange.parts.path : null,
					path: event.parts.path,
				});
			}
			
			if (!prevChange || prevChange.parts.search != event.parts.search) {
				this.trigger('change-search', {
					href: event.href,
					parts: event.parts,
					prevSearch: prevChange ? prevChange.parts.search : null,
					search: event.parts.search,
				});
			}
			
			if (!prevChange || prevChange.parts.hash != event.parts.hash) {
				this.trigger('change-hash', {
					href: event.href,
					parts: event.parts,
					prevHash: prevChange ? prevChange.parts.hash : null,
					hash: event.parts.hash,
				});
			}
			
			prevChange = JSON.parse(JSON.stringify({
				href: event.href,
				parts: event.parts,
			}));
		});
	}
	
	LocationHelper.prototype.parseParams = function (s) {
		var res = {};
		s = s.split('&');
		var param;
		for (var i = 0; i < s.length; i++) {
			if (!s[i])
				continue;
			param = s[i].split('=', 2);
			LocationHelper.setValueByPath(res, param[0], param.length > 1 ? param[1] : true);
		}
		return res;
	};
	
	LocationHelper.setValueByPath = function (o, path, value) {
		if (!(path instanceof Array)) {
			path = path.replace(/^([^\[]+)/, '[$1]');
			path = path.slice(1, -1).split('][');
		}
		if (typeof value == 'string')
			value = decodeURIComponent(value);
		
		var name = path.pop();
		var res = o;
		var dir = false;
		while (path.length > 0) {
			dir = decodeURIComponent(path.shift());
			
			if (dir === '') {
				if (o[dir] && !(o[dir] instanceof Array))
					o[dir] = [];
			}
			else if (typeof o[dir] != 'object' || !o[dir]) {
				o[dir] = {};
			}
			
			if (path.length) {
				o = o[dir];
			}
		}
		
		if (name === '') {
			if (dir !== false && !(o[dir] instanceof Array))
				o[dir] = [];
			if (dir !== false)
				o = o[dir];
			o.push(value);
		}
		else {
			if (dir !== false)
				o = o[dir];
			o[name] = value;
		}
		
		return o;
	};
	
	var parseURLRegExp = /^(?:(https?|file):\/\/(?:([^\/:]+)(?::(\d+))?|))?(\/[^?#]*)?(\/?[^#]*)?(#\S*)?/;
	
	LocationHelper.prototype.parseURL = function (url) {
		var res = parseURLRegExp.exec(url);
		if (!res)
			return false;
		res = {
			schema: res[1],
			protocol: res[1] && res[1] + ':' || res[1],
			host: res[2],
			port: res[3],
			path: res[4],
			search: res[5],
			hash: res[6],
		};
		
		return res;
	};
	
	LocationHelper.prototype.buildURL = function (parts, baseParts) {
		if (!parts.protocol || parts.schema)
			parts.protocol = parts.schema + ':';
		else if (parts.protocol || !parts.schema)
			parts.schema = parts.protocol.slice(0, -1);
		
		if (baseParts) {
			if (!parts.protocol || !parts.host || !parts.port) {
				parts.protocol = baseParts.protocol;
				parts.schema = baseParts.schema;
				parts.host = baseParts.host;
				parts.port = baseParts.port;
			}
			if (!parts.path) {
				parts.path = baseParts.path;
			}
			if (parts.hash) {
				var newHash = parts.hash.split('!', 2);
				if (newHash.length < 2)
					newHash[1] = '';
				newHash[0] = newHash[0].length > 1 ? newHash[0] : (baseParts.hash && baseParts.hash.split('!')[0] || '');
				if (!newHash[1]) {
					newHash[1] = baseParts.hash.split('!')[1] || '';
				}
				else if (newHash[1][0] == '&') {
					newHash[1] = newHash[1].substr(1).split('&');
					var currentHashParams = this.getHashParams();
					for (var i = 0; i < newHash[1].length; i++) {
						var s = newHash[1][i].split('=', 2);
						LocationHelper.setValueByPath(currentHashParams, s[0], s[1]);
					}
					newHash[1] = this.buildParams(currentHashParams);
				}
				if (!newHash[1])
					newHash = [ newHash[0] ];
				if (newHash[1] && !newHash[0])
					newHash[0] = '#';
				parts.hash = newHash.join('!');
			}
		}
		
		var s = [
			parts.path || '',
			parts.search || '',
			parts.hash || '',
		];
		
		if (parts.protocol == 'file:') {
			s.unshift(parts.protocol + '//');
		}
		else if (parts.host && parts.protocol) {
			if (parts.port)
				s.unshift(':' + parts.port);
			s.unshift(parts.host);
			s.unshift(parts.protocol + '//');
		}
		
		return s.join('');
	};
	
	LocationHelper.prototype.buildParams = function (o, parent) {
		if (typeof o != 'object')
			return parent + '=' + encodeURIComponent(o);
		
		var s = [];
		if (o instanceof Array) {
			for (var i = 0; i < o.length; i++) {
				var v = o[i];
				var path = parent ? parent + '[]' : '[]';
				s.push(this.buildParams(v, path));
			}
		}
		else {
			for (var k in o) {
				var v = o[k];
				var path = parent ? parent + '[' + encodeURIComponent(k) + ']' : encodeURIComponent(k);
				s.push(this.buildParams(v, path));
			}
		}
		return s.join('&');
	};
	
	LocationHelper.prototype.getHref = function () {
		return document.location.href;
	};
	
	LocationHelper.prototype.getHash = function () {
		return document.location.hash;
	};
	
	LocationHelper.prototype.getSearch = function () {
		return document.location.search;
	};
	
	LocationHelper.prototype.getHashParams = function () {
		var s = this.getHash();
		return this.parseParams(s.split('!', 2)[1] || '');
	};
	
	LocationHelper.prototype.getSearchParams = function () {
		var s = this.getSearch();
		return this.parseParams(s);
	};
	
	LocationHelper.prototype.setLocation = function (hrefOrParts, replace, originalEvent) {
		var parts = typeof hrefOrParts == 'object' ? hrefOrParts : this.parseURL(hrefOrParts);
		var curParts = this.parseURL(this.getHref());
		var href = this.buildURL(parts, curParts);
		
		history[replace ? 'replaceState' : 'pushState']({
			href: href,
			parts: parts,
		}, '', href);
		
		this.trigger('change', {
			href: href,
			parts: parts,
			originalEvent: originalEvent,
		});
		
		return this;
	};
	
	var bindParams = false;
	
	LocationHelper.prototype.bind = function (_bindParams) {
		_bindParams = _bindParams || true;
		if (!history || !history.pushState)
			return this;
		
		if (bindParams) {
			bindParams = _bindParams;
			return this;
		}
		bindParams = _bindParams;
		
		this.setLocation(document.location.href, true);
		var _this = this;
		
		window.addEventListener('popstate', function (event) {
			if (!event.state)
				return;
			_this.trigger('change', {
				href: event.state.href,
				parts: event.state.parts,
				originalEvent: event,
			});
		}, false);
		
		document.body.addEventListener('click', function (event) {
			if (event.target.nodeName != 'A' || !event.target.href)
				return;
			
			var a = event.target;
			var curParts = _this.parseURL(_this.getHref());
			var parts = _this.parseURL(a.href);
			if (!parts)
				return;
			if (parts.host != curParts.host || parts.protocol != curParts.protocol || parts.port != curParts.port)
				return;
			
			if (bindParams !== true && bindParams.path && curParts.path != parts.path)
				return;
			if (bindParams !== true && bindParams.search && curParts.search != parts.search)
				return;
			if (bindParams !== true && bindParams.hash && curParts.hash != parts.hash)
				return;
			
			_this.setLocation(parts, false);
			
			event.preventDefault();
		}, false);
		
		return this;
	}
	
	return new LocationHelper();
})();
