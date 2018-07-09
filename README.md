## bibtex-parse

Parse BibTeX to JSON.

```sh
npm install bibtex-parse
```

### Example

```js
const bibtexParse = require('bibtex-parse');
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
{
  "commentsBefore": [
    "references"
  ],
  "preamble": null,
  "entries": [
    {
      "type": "inproceedings",
      "id": "Smith2009",
      "properties": {
        "author": { "value": "Caroline JA Smith", "brace": "quote" },
        "year": { "value": 2009, "brace": "none" },
        "month": { "value": "dec", "brace": "none" },
        "title": { "value": "{Quantum somethings}", "brace": "curly" },
        "journal": { "value": "Journal of {B}lah", "brace": "curly" }
      },
      "comments": []
    },
    {
      "type": "book",
      "id": "IP:1990",
      "properties": {
        "author": { "value": "Prince, Ian", "brace": "quote" },
        "year": { "value": "1990", "brace": "curly" },
        "title": { "value": "Methods for Research", "brace": "curly" }
      },
      "comments": []
    }
  ],
  "commentsAfter": []
}
```
