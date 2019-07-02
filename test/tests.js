/* jshint esversion: 6 */
const { test } = require('tap');
const { parse } = require('..');
const fs = require('fs');

test('parse', t => {
	t.plan(1);
	let bibtex = fs.readFileSync(`${__dirname}/example1.bib`, 'utf8'),
		expected = JSON.parse(fs.readFileSync(`${__dirname}/example1-expected.json`, 'utf8')),
		result = parse(bibtex);
	t.same(result, expected);
});

test('parse', t => {
	t.plan(1);
	let bibtex = fs.readFileSync(`${__dirname}/example2.bib`, 'utf8'),
		expected = JSON.parse(fs.readFileSync(`${__dirname}/example2-expected.json`, 'utf8')),
		result = parse(bibtex);
	t.same(result, expected);
});

test('error', t => {
	t.plan(3);
	try {
		let bibtex = fs.readFileSync(`${__dirname}/example3.bib`, 'utf8');
		parse(bibtex);
	} catch (e) {
		t.equal(e.name, 'SyntaxError');
		t.equal(e.location.start.line, 3);
		t.equal(e.location.start.column, 3);
	}
});
