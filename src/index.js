/* jshint node: true, esversion: 6, unused: true */
'use strict';
import parser from './bibtex.pegjs';

const STRINGS = {
	jan: 'January',
	feb: 'February',
	mar: 'March',
	apr: 'April',
	may: 'May',
	jun: 'June',
	jul: 'July',
	aug: 'August',
	sep: 'September',
	oct: 'October',
	nov: 'November',
	dec: 'December'
};

export const parse = (str, options) => parser.parse(str, options);

const stripMatchingBraces = str => {
	// remove matching curly braces, excluding escaped braces
	while (str.match(/(^|[^\\])\{.*?([^\\])\}/s)) {
		str = str.replace(/(^|[^\\])\{(.*?)([^\\])\}/s, '$1$2$3');
	}
	return str;
};

export const entries = (str, options) => {
	let items = parse(str, options),
		entries = [],
		strings = { ...STRINGS },
		evaluate = (datatype, value) => {
			if (datatype === 'number') {
				return value;
			} else if (datatype === 'quoted' || datatype === 'braced') {
				return stripMatchingBraces(value).replace(/\\(["'%@{}()_])/g, '$1'); // unescape characters
			} else if (datatype === 'identifier') {
				return strings[value] || '';
			} else if (datatype === 'concatinate') {
				return value
					.map(({ datatype, value }) => evaluate(datatype, value))
					.join('');
			} else if (datatype === 'null') {
				return null;
			}
		};
	for (let item of items) {
		if (item.itemtype === 'string') {
			strings[item.name] = evaluate(item.datatype, item.value);
		} else if (item.itemtype === 'entry') {
			let entry = { key: item.key, type: item.type };
			for (let field of item.fields) {
				entry[field.name.toUpperCase()] = evaluate(field.datatype, field.value);
			}
			entries.push(entry);
		}
	}
	return entries;
};

export default { parse, entries };
