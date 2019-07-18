/* jshint esversion: 6 */
const { test } = require('tap');
const bibtexParse = require('..');
const fs = require('fs');

const renderValue = (value, datatype) => {
	if (datatype === 'concatinate') {
		return value.map(({ value, datatype }) => renderValue(value, datatype)).join(' # ');
	} else if (datatype === 'braced') {
		return `{${value}}`;
	} else if (datatype === 'quoted') {
		return `"${value}"`;
	} else if (datatype === 'number' || datatype === 'identifier' || datatype === 'unenclosed') {
		return value;
	}
};

const hash = bibtex => {
	return bibtex
		.toLowerCase()
		.replace(/\s+/g, '')
		.replace(/@/g, '\n@')
		.replace(/([a-zA-Z_-]+=)/g, '\n  $1')
		.replace(/\(/g, '{')
		.replace(/\)/g, '}')
		.replace(/,}/g, '}')
		.replace(/,([a-zA-Z_-]+[},])/g, ',\n  $1');
};

const render = items => {
	return items.map(item => {
		if (item.itemtype === 'comment') {
			return item.comment;
		} else if (item.itemtype === 'preamble') {
			let value = renderValue(item.value, item.datatype);
			return '@preamble' + (
				item.enclosed === 'braces' ? `{${value}}` :
				item.enclosed === 'parentheses' ? `(${value})` : value);
		} else if (item.itemtype === 'string') {
			let assignment = `${item.name} = ${renderValue(item.value, item.datatype)}`;
			return '@string' + (
				item.enclosed === 'braces' ? `{${assignment}}` : `(${assignment})`);
		} else if (item.itemtype === 'entry') {
			return `@${item.type}{${item.key ? item.key + ',' : ''}` +
				item.fields.map(({ name, value, datatype }) => {
					return `${name}${datatype !== 'null' ? ` = ${renderValue(value, datatype)}` : ''}`;
				}) + '}';
		}
	}).join('');
};

test('get entries', t => {
	t.plan(1);
	let bibtex = `@preamble{"Reference list"}
			@string{ian = "Brown, Ian"}
			@string{jane = "Woods, Jane"}
			%references
			@inproceedings{Smith2009,
			  author=jane,
			  year=2009,
			  month=dec,
			  title={{Quantum somethings}},
			  journal={Journal of {B}lah}
			}

			@book{IP:1990,
			author = ian # " and " # jane,
			year = {1990},
			title = {Methods for Research}
			}`,
		expected = [
			{
				key: "Smith2009",
				type: "inproceedings",
				AUTHOR: "Woods, Jane",
				YEAR: 2009,
				MONTH: "December",
				TITLE: "Quantum somethings",
				JOURNAL: "Journal of Blah"
			},
			{
				key: "IP:1990",
				type: "book",
				AUTHOR: "Brown, Ian and Woods, Jane",
				YEAR: "1990",
				TITLE: "Methods for Research"
			}
		];
	t.same(bibtexParse.entries(bibtex), expected);
});

// test('error', t => {
// 	t.plan(3);
// 	try {
// 		let bibtex = fs.readFileSync(`${__dirname}/example3.bib`, 'utf8');
// 		parse(bibtex);
// 	} catch (e) {
// 		t.equal(e.name, 'SyntaxError');
// 		t.equal(e.location.start.line, 3);
// 		t.equal(e.location.start.column, 3);
// 	}
// });

let files = fs.readdirSync(`${__dirname}/valid`);
for (let bib of files) {
	if (!bib.endsWith('.bib')) { continue; }
	
	let bibtex = fs.readFileSync(`${__dirname}/valid/${bib}`, 'utf8'),
		expectedTree, expectedEntries;
	try {
		expectedTree =  JSON.parse(fs.readFileSync(`${__dirname}/valid/${bib.slice(0, -4)}-tree.json`, 'utf8'));
	} catch (e) {}
	try {
		expectedEntries =  JSON.parse(fs.readFileSync(`${__dirname}/valid/${bib.slice(0, -4)}-entries.json`, 'utf8'));
	} catch (e) {}
	
	test(`valid bib: ${bib}`, t => {
		t.plan(3 + (expectedTree ? 1 : 0) + (expectedEntries ? 1 : 0));
		let items = [],
			entries = [],
			error;
		try {
			items = bibtexParse.parse(bibtex);
			entries = bibtexParse.entries(bibtex);
		} catch (e) {
			error = e;
		}
		t.same(bib === 'empty.bib' ? items.length === 0 : items.length > 0, true);
		t.same(hash(render(items)), hash(bibtex));
		t.same(error, undefined);
		if (expectedTree) {
			t.same(items, expectedTree);
		} else {
			//fs.writeFileSync(`${__dirname}/valid/${bib.slice(0, -4)}-tree.json`, 'q' + JSON.stringify(items, null, '\t'));
			//fs.unlinkSync(`${__dirname}/valid/${bib.slice(0, -4)}-tree.json`);
		} 
		if (expectedEntries) {
			t.same(entries, expectedEntries);
		} else {
			//fs.writeFileSync(`${__dirname}/valid/${bib.slice(0, -4)}-entries.json`, 'q' + JSON.stringify(entries, null, '\t'));
			//fs.unlinkSync(`${__dirname}/valid/${bib.slice(0, -4)}-entries.json`);
		}
	});
}

let bibs = fs.readdirSync(`${__dirname}/invalid`);
for (let bib of bibs) {
	test(`invalid bib from third party: ${bib}`, t => {
		t.plan(3);
		let bibtex = fs.readFileSync(`${__dirname}/invalid/${bib}`, 'utf8');
		try {
			bibtexParse.parse(bibtex);
		} catch (e) {
			t.equal(e.name, 'SyntaxError');
			t.equal(e.location.start.line, 1);
			t.equal(e.location.start.column, 1);
		}
	});
}
