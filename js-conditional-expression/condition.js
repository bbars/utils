function Condition() {}
Condition.prototype = Object.create(Array.prototype);
Condition.prototype.constructor = Condition;

Condition.prototype.toString = function () {
	return this.map(function (v) {
		return v instanceof Condition ? '(' + v.toString() + ')' : v;
	}).join(' ');
};

Condition.parseRe = /(.*?)(&&|\|\||[()]|["']|$)/;
Condition.parse = function (s, outer) {
	var res = outer || new Condition();
	var next = null;
	var expr = '';
	var openQuote = '';
	var op = '';
	var level = 0;
	do {
		next = this.parseRe.exec(s);
		if (!next) {
			break;
		}
		
		op = next[2];
		s = s.slice(next[0].length);
		
		if (openQuote) {
			expr += next[0];
			if (openQuote == op)
				openQuote = '';
			continue;
		}
		else if (op == '"' || op == "'") {
			openQuote = op;
			expr += next[0];
			continue;
		}
		else {
			expr += next[1];
		}
		
		expr = expr.trim();
		
		if (op == '(') {
			level++;
			var inner = new Condition();
			s = parse(s, inner);
			res.push(inner);
		}
		else if (op == ')') {
			if (expr) res.push(expr);
			level--;
			if (level < 0)
				break;
		}
		else if (op == '&&') {
			if (expr) res.push(expr);
			res.push(op);
			
		}
		else if (op == '||') {
			if (expr) res.push(expr);
			res.push(op);
		}
		else {
			res.push(expr);
		}
		
		expr = '';
		re.lastIndex = -1;
	} while (s.trim());
	
	
	for (var i = res.length - 1; i >= 0; i--) {
		if (res[i] instanceof Array && res[i].length == 1) {
			res.splice(i, 1, res[i][0]);
		}
		var item = res[i];
		if (!(item instanceof Array) && item != '&&' && item != '||') {
			res[i] = Expression.parse(res[i]) || res[i];
		}
	}
	
	return outer ? s : res;
}

function Expression(name, op, value) {
	this.name = name === null || typeof name == 'undefined' ? null : name.trim();
	this.op = op === null || typeof op == 'undefined' ? null : op.trim();
	this.value = value === null || typeof value == 'undefined' ? null : value.trim();
	if (this.value && this.value[0] == this.value[this.value.length-1] && (this.value[0] == '"' || this.value[0] == "'")) {
		this.value = this.value.slice(1, -1);
	}
}

Expression.parseRe = /^\s*(.*)\s*(<|>|!?==?|[<>]==?)(.*)$/;
Expression.parse = function (s) {
	var o = this.parseRe.exec(s) || [];
	return new this.prototype.constructor(o[1] || s, o[2] || null, o[3] || null);
};

Expression.prototype.toString = function () {
	var quote = '';
	if (/(&&|\|\||[()])/.test(this.value)) {
		if (this.value.indexOf('"') < 0)
			quote = '"';
		else
			quote = "'";
	}
	return this.name + (this.op || '') + quote + (this.value || '') + quote;
};
