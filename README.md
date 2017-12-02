## bibtex-parse

Parse BibTeX to JSON.

```sh
npm install bibtex-parse
```

```js
const bibtexParse = require('bibtex-parse');
const bibtex = fs.readFileSync('references.bib', 'utf8');
bibtexParse.parse(bibtex);
/* 
[{
	type: 'article',
	id: 'Smith2009',
	properties: {
		author: 'Caroline JA Smith',
		title: 'Quantum somethings',
		journal: 'Journal of Blah'
	}
}, ...]
*/
```
