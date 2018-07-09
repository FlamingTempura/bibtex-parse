/* jshint esversion: 6 */
const bibtexParse = require('..');
const fs = require('fs');
const path = require('path');

let bib = fs.readFileSync(path.join(__dirname, 'example.bib'), 'utf8'),
	parsed = bibtexParse.parse(bib);

console.log(JSON.stringify(parsed, null, 2));
