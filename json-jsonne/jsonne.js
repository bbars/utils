var JSONNE = new (function () {
    function _escape(name) {
        if (!_escape.re)
            _escape.re = /^[$A-Za-z0-9_-]+$/;
        return _escape.re.test(name) ? name : JSON.stringify(name);
    }
    function _unescape(name) {
        name = name.trim();
        if (!name)
            return;
        if (name[0] === '"')
            return JSON.parse(name);
        if (name[0] === "'") {
            if (name[name.length-1] !== "'")
                return;
            return name.slice(1, -1);
        }
        return name;
    }
    function _unescapeValue(str) {
        str = str.trim();
        if (!str) {
            return undefined;
        }
        if (str[0] === '"' || str[0] === "'")
            return _unescape(str);
        if (str === 'null')
            return null;
        if (str === 'false')
            return false;
        if (str === 'true')
            return true;
        if (str.indexOf('.') > -1)
            return parseFloat(str);
        else
            return parseInt(str);
    }
    function last() {
        return this[this.length - 1];
    }
    
    function get(o, path) {
        for (var i = 1; i < path.length; i++) {
            if (typeof o !== 'object')
                throw 'Unreachable path: ' + path.slice(0, i).join('.');
            o = o[path[i]];
        }
        return o;
    }
    function set(o, path, value) {
        for (var i = 1; i < path.length - 1; i++) {
            if (typeof o !== 'object')
                throw 'Unreachable path: ' + path.slice(0, i).join('.');
            o = o[path[i]];
        }
        if (typeof o !== 'object' || path.length <= i)
            throw 'Unreachable path: ' + path.slice(0, i).join('.');
        return o[path[i]] = value;
    }
    
    this.defaultReviver = undefined;
    
    this.stringify = function (value, replacer, space) {
        var map = new Map();
        var _this = this;
        function stringify(k, o, ks, level, t) {
            if (typeof o === 'function')
                return null;
            t = t || '';
            if (replacer)
                o = replacer(k, o);
            var _space0 = !space ? '' : ' ';
            var _space1 = !space ? '' : '\n' + new Array(level + 1).fill(space).join('');
            var _space2 = !space ? '' : '\n' + new Array(level + 0).fill(space).join('');
            if (typeof o === 'undefined') {
                return 'undefined';
            }
            else if (o instanceof Array) {
                if (!t)
                    t = o.constructor.name;
                res = '[' + _space1 + o.map(function (v, i) {
                    return stringify(i, v, ks + '.' + i, level + 1);
                }).filter(function (v) { return v !== null }).join(',' + _space1) + _space2 + ']';
            }
            else if (o && typeof o === 'object') {
                if (map.has(o))
                    return '@' + map.get(o);
                map.set(o, ks);
                t = o.constructor ? _escape(o.constructor.name) : t;
                if (typeof o.toJSON === 'function') {
                    o = o.toJSON();
                    if (o === null || typeof o !== 'object' || typeof o.toJSON !== 'function')
                        return stringify(k, o, ks, level + 1, t);
                }
                var res = [];
                var ke, ve;
                for (var prop in o) {
                    ke = _escape(prop);
                    ve = stringify(prop, o[prop], ks + '.' + ke, level + 1);
                    if (ve === null)
                        continue;
                    res.push(ke + ':' + _space0 + ve);
                }
                res = '{' + _space1 + res.join(',' + _space1) + _space2 + '}';
            }
            else {
                res = JSON.stringify(o);
                if (t)
                    res = '(' + res + ')';
            }
            return (t ? _escape(t) : '') + res;
        }
        return stringify(null, value, 'root', 0);
    };
    
    this.parse = function (str, reviver) {
        var _this = this;
        if (typeof reviver === 'undefined' || reviver === null)
            reviver = this.defaultReviver;
        if (reviver && typeof reviver !== 'function') {
            reviver = null;
        }
        function parseStr(quote) {
            var res = quote;
            var re = quote === '"' ? /(\\*)"/g : /(\\*)'/g;
            var m;
            while (m = re.exec(str)) {
                if (m[1].length % 2 === 0) {
                    res += str.slice(0, m.index + m[1].length);
                    str = str.slice(m.index + m[0].length);
                    break;
                }
            }
            if (!str)
                throw 'Unmached opening quote';
            return res + quote;
        }
        function parseLink() {
            var res = [];
            var re = /^([\s\S]*?)([."',}\]])/;
            var m, left, cur;
            while (m = re.exec(str)) {
                mIndex = m.index;
                left = m[1].trim();
                cur = m[2];
                if (cur === ',') {
                    str = str.slice(m.index + m[1].length);
                    if (left)
                        res.push(_unescape(left));
                    break;
                }
                else if (cur === '}' || cur === ']') {
                    str = str.slice(m.index + m[1].length);
                    if (left)
                        res.push(_unescape(left));
                    break;
                }
                else if (cur === '.') {
                    if (!res.length && !_unescape(left))
                        res = nameStack.slice(0, -1);
                    else
                        res.push(_unescape(left));
                    str = str.slice(m.index + m[0].length);
                }
                else if (left) {
                    throw 'Unexpected token: "' + left + '"';
                }
                else {
                    str = str.slice(m[0].length);
                    res.push(_unescape(parseStr(cur)));
                }
            }
            return res;
        }
        var tokenRe = /([{}\[\]"':,@()]|$)/;
        var cap = { str: '' };
        var left = '';
        var res;
        var stack = [];
        stack.last = last;
        var nameStack = ['root'];
        nameStack.last = last;
        var infoStack = [];
        var links = [];
        while (token = tokenRe.exec(str)) {
            left += str.slice(0, token.index);
            str = str.slice(token.index + token[0].length);
            token = token[0];
            if (token === '{') {
                stack.push({});
                infoStack.push(left);
                left = '';
            }
            else if (token === '[') {
                stack.push([]);
                infoStack.push(left);
                left = '';
            }
            else if (token === '(') {
                infoStack.push(left);
                left = '';
            }
            else if (token === '"' || token === "'") {
                if (left.trim())
                    throw 'Unexpected opening quote near "' + left + '")';
                left = parseStr(token);
            }
            else if (token === ')') {
            }
            else if (token === ':') {
                nameStack.push(_unescape(left));
                left = '';
            }
            else if (token === ',' || token === '') {
                var o = stack.last();
                left = _unescapeValue(left);
                var t = infoStack.length > stack.length ? infoStack.pop() : undefined;
                if (o instanceof Array) {
                    if (reviver) {
                        left = reviver(o.length, left, t);
                    }
                    o.push(left);
                }
                else if (left !== undefined) {
                    if (reviver) {
                        left = reviver(nameStack.last(), left, t);
                    }
                    o[nameStack.pop()] = left;
                }
                left = '';
            }
            else if (token === '}' || token === ']') {
                var o = stack.pop();
                var oInfo = infoStack.pop();
                
                left = _unescapeValue(left);
                var t = infoStack.length > stack.length ? infoStack.pop() : undefined;
                if (o instanceof Array) {
                    if (reviver) {
                        left = reviver(o.length, left, t);
                    }
                    o.push(left);
                }
                else if (left !== undefined) {
                    if (reviver) {
                        left = reviver(nameStack.last(), left, t);
                    }
                    o[nameStack.pop()] = left;
                }
                left = '';
                
                if (reviver) {
                    o = reviver(nameStack.last(), o, oInfo);
                }
                if (!stack.length) {
                    res = o;
                    break;
                }
                stack.last()[nameStack.pop()] = o;
            }
            else if (token === '@') {
                if (left.trim())
                    throw 'Unexpected link near "' + left + '"';
                links.push([[].concat(nameStack), parseLink()]);
                var o = stack.last();
                if (o instanceof Array)
                    o.push(undefined);
                else {
                    o[nameStack.pop()] = undefined;
                }
                left = '';
            }
        }
        var link;
        for (var i = links.length - 1; i >= 0; i--) {
            link = links[i];
            set(res, link[0], get(res, link[1]));
        }
        return res;
    };
})();
