/* jshint node: true, esversion: 6, unused: true */
'use strict';
import { parse as parseBibTex } from './generated_grammar';

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

export type Value = string | number | bigint;

type Datatype =
	| 'quoted'
	| 'braced'
	| 'number'
	| 'identifier'
	| 'null'
	| 'concatinate'
	| 'unenclosed';

export interface Field {
	name: String;
	value: Value;
	datatype: Datatype;
	raw: string;
}

export interface BibTeXPreambleItem {
	itemtype: 'preamble';
	raw: string;
}
export interface BibTeXStringItem {
	itemtype: 'string';
	datatype: Datatype;
	name: string;
	value: string;
	raw: string;
}
export interface BibTeXEntryItem {
	itemtype: 'entry';
	key: string;
	type: string;
	fields: Field[];
	raw: string;
}
export interface BibTeXCommentItem {
	itemtype: 'comment';
	comment: string;
	raw: string;
}

export type BibTeXItem =
	| BibTeXPreambleItem
	| BibTeXStringItem
	| BibTeXEntryItem
	| BibTeXCommentItem;

export interface BibTeXEntry {
	key: string;
	type: string;
	[key: string]: Value | null;
}

interface ParseOptions {
	// How numbers should be returned.
	// - `auto` (default): return a JavaScript number, unless over [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (9007199254740991), in which case a BigInt is returned.
	// - `number`: always return a JavaScript number, even if over MAX_SAFE_INTEGER (in which case the precision will be lost).
	// - `bigint`: always return a BigInt.
	// - `string`: return number as a string.
	number: null | 'auto' | 'bigint' | 'number' | 'string';
}

const stripMatchingBraces = (str: string): string => {
	// remove matching curly braces, excluding escaped braces
	while (str.match(/(^|[^\\])\{.*?([^\\])\}/s)) {
		str = str.replace(/(^|[^\\])\{(.*?)([^\\])\}/s, '$1$2$3');
	}
	return str;
};

const parse = (bibtex: string, options?: ParseOptions): BibTeXItem[] => {
	const untypedItems = parse(bibtex, options);
	const items = [];
	for (const item of items) {
		switch (item.itemtype) {
			case 'preamble':
				items.push(item as BibTeXPreambleItem);
				break;
			case 'string':
				items.push(item as BibTeXStringItem);
				break;
			case 'entry':
				items.push(item as BibTeXEntryItem);
				break;
			case 'comment':
				items.push(item as BibTeXCommentItem);
				break;
		}
	}
	return items;
};

const evaluate = (
	datatype: Datatype,
	value,
	strings: { [key: string]: Value }
) => {
	if (datatype === 'number') {
		return value;
	} else if (datatype === 'quoted' || datatype === 'braced') {
		return stripMatchingBraces(value).replace(/\\(["'%@{}()_])/g, '$1'); // unescape characters
	} else if (datatype === 'identifier') {
		return strings[value] || '';
	} else if (datatype === 'concatinate') {
		return value
			.map(({ datatype, value }) => evaluate(datatype, value, strings))
			.join('');
	} else if (datatype === 'null') {
		return null;
	}
};

export const entries = (
	bibtex: string,
	options: ParseOptions
): BibTeXEntry[] => {
	const items: BibTeXItem[] = parse(bibtex, options);

	const entries: BibTeXEntry[] = [];
	const strings = { ...STRINGS };

	for (const item of items) {
		if (item.itemtype === 'string') {
			strings[item.name] = evaluate(item.datatype, item.value, strings);
		} else if (item.itemtype === 'entry') {
			const entry: BibTeXEntry = { key: item.key, type: item.type };
			for (let field of item.fields) {
				entry[field.name.toUpperCase()] = evaluate(
					field.datatype,
					field.value,
					strings
				);
			}
			entries.push(entry);
		}
	}

	return entries;
};

export default { parse, entries };
