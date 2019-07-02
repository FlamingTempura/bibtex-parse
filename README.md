## bibtex-parse

Parse BibTeX to JSON.

```sh
npm install bibtex-parse
```

### Example

```js
const bibtexParse = require('bibtex-parse');
const fs = require('fs');
const bibtex = fs.readFileSync('example.bib', 'utf8');
bibtexParse.parse(bibtex);
```

`example.bib`:
```bib
%references
@inproceedings{Smith2009,
  author="Caroline JA Smith",
  year=2009,
  month=dec,
  title={{Quantum somethings}},
  journal={Journal of {B}lah}
}

@book{IP:1990,
author = "Prince, Ian",
year = {1990},
title = {Methods for Research}
}
```

output:
```json
[
  {
    "type": "comment",
    "comment": "%references\n"
  },
  {
    "type": "inproceedings",
    "id": "Smith2009",
    "properties": {
      "author": { "value": "Caroline JA Smith", "enclosed": "quote" },
      "year": { "value": 2009, "enclosed": null },
      "month": { "value": "dec", "enclosed": null },
      "title": { "value": "{Quantum somethings}", "enclosed": "curly" },
      "journal": { "value": "Journal of {B}lah", "enclosed": "curly" }
    }
  },
  {
    "type": "comment",
    "comment": "\n\n"
  },
  {
    "type": "book",
    "id": "IP:1990",
    "properties": {
      "author": { "value": "Prince, Ian", "enclosed": "quote" },
      "year": { "value": "1990", "enclosed": "curly" },
      "title": { "value": "Methods for Research", "enclosed": "curly" }
    }
  }
]
```