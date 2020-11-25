function Sheet() {
	this.header = [];
	this.data = [];
}

Sheet.prototype.getObject = function (y, header) {
	var row = this.data[y];
	if (!row) {
		return null;
	}
	header = !header ? this.header : [].concat(header);
	var o = {};
	for (var x = 0; x < header.length; x++) {
		if (header[x] === undefined || header[x] === null) {
			continue;
		}
		o[header[x]] = row[x];
	}
	return o;
};

Sheet.parseCsv = function (s, headerIncluded, colSep, rowSep) {
	headerIncluded = !!headerIncluded;
	var isHeader = headerIncluded;
	rowSep = (rowSep || '\n').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	colSep = (colSep || ',').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	var re = new RegExp('(' + rowSep + ')|(' + colSep + ')|($)', 'g');
	var x = 0;
	var y = 0;
	var i = 0;
	var m, value;
	var res = new Sheet();
	
	while (i < s.length) {
		value = null;
		
		if (s[i] === colSep) {
			x++;
			i++;
			continue;
		}
		else if (s[i] === rowSep) {
			y++;
			i++;
			x = 0;
			if (isHeader) {
				isHeader = false;
				y = 0;
			}
			continue;
		}
		
		if (s[i] === '"') {
			var m2, re2 = /("+)|($)/g;
			re2.lastIndex = i + 1;
			while (m2 = re2.exec(s)) {
				if (m2[2] !== undefined) {
					throw new Error("Unmatched quote");
				}
				if (m2[1].length % 2 > 0) {
					break; // closing quote found
				}
			}
			value = s.substring(i + 1, re2.lastIndex - 1);
			value = value.replace(/""/g, '"');
			i = re2.lastIndex;
		}
		else {
			re.lastIndex = i + 1;
			m = re.exec(s);
			if (m) {
				value = s.substring(i, m.index);
				i = re.lastIndex - 1;
			}
			else {
				value = s.substring(i);
				i = s.length;
			}
		}
		
		if (isHeader) {
			res.header[x] = value;
		}
		else {
			if (!res.data[y]) {
				res.data[y] = [];
			}
			res.data[y][x] = value;
		}
	}
	return res;
};
