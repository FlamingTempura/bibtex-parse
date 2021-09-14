## bibtex-parse

Parse BibTeX to JSON.

```sh
npm install bibtex-parse
```

## Example

```js
const bibtexParse = require('bibtex-parse');
const fs = require('fs');
const bibtex = fs.readFileSync('example.bib', 'utf8');
bibtexParse.entries(bibtex);
```

`example.bib`:

```bib
@preamble{"Reference list"}
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
}
```

output:

```json
[
  {
    "key": "Smith2009",
    "type": "inproceedings",
    "fileLocation": {
      "start": {"offset": 113, "line": 5, "column": 16},
      "end": {"offset": 227, "line": 11, "column": 1}
    },
    "AUTHOR": "Woods, Jane",
    "YEAR": 2009,
    "MONTH": "December",
    "TITLE": "Quantum somethings",
    "JOURNAL": "Journal of Blah"
  },
  {
    "key": "IP:1990",
    "type": "book",
    "fileLocation": {
      "start": {"offset": 236, "line": 13, "column": 7},
      "end": {"offset": 322, "line": 17, "column": 1}
    },
    "AUTHOR": "Brown, Ian and Woods, Jane",
    "YEAR": "1990",
    "TITLE": "Methods for Research"
  }
]
```

Note: fields are always output in capitals to distinguish from build in attributes (`key` and `type`).

## Abstract Syntax Tree

To get the AST, use:

```js
bibtexParse.parse(bibtex, options);
```

Where `bibtex` is a string representing bibtex to be parsed, and options an object with any of the following:

- `number`: tells the parser how numbers should be returned.
  - `number: "auto"` (default): return a JavaScript number, unless over [MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (9007199254740991), in which case a BigInt is returned.
  - `number: "number"`: always return a JavaScript number, even if over MAX_SAFE_INTEGER (in which case the precision will be lost).
  - `number: "bigint"`: always return a BigInt.
  - `number: "string"`: return number as a string.

This will return an array of items. There are four types of item:

- **string**: `{ itemtype: 'string', name, value, datatype, enclosed }`
- **preamble**: `{ itemtype: 'preamble', value, datatype, enclosed }`
- **comment**: `{ itemtype: 'comment', comment }`
- **entry**: `{ itemtype: 'entry', type, key, enclosed, fields }`,
  - `type`: e.g. article, inproceedings, book
  - `key`: the unique identifier for the entry
  - `fields`: e.g. title, year `[{ name: 'year', value: 2001, datatype: 'number' }, ...]`

Datatype can be one of the following:

- `number`: an integer number
- `identifier`: a string variable name
- `braced`: a value which was enclosed in curly braces
- `quoted`: a value which was enclosed in double quotes
- `concatinate`: in which case the corresponding `value` property will be an array `[{ datatype, value }, ...]`
- `null`: used when no value has been assigned, e.g. `@string{a}`
- `unenclosed`: used when a preamble has not been properly enclosed (e.g `@preamble{this isn't enclosed}`).

Enclosed can be one of the following:

- `braces` - when item is enclosed in curly braces (e.g. `@string{a = 1}`)
- `parentheses` - when item is enclosed in brackets (e.g. `@string(a = 1)`)

```json
[
  {
    "itemtype": "preamble",
    "enclosed": "braces",
    "value": "Reference list",
    "datatype": "quoted",
    "raw": "\"Reference list\""
  },
  { "itemtype": "comment", "comment": "\n" },
  {
    "itemtype": "string",
    "name": "ian",
    "value": "Brown, Ian",
    "datatype": "quoted",
    "raw": "\"Brown, Ian\""
  },
  { "itemtype": "comment", "comment": "\n" },
  {
    "itemtype": "string",
    "name": "jane",
    "value": "Woods, Jane",
    "datatype": "quoted",
    "raw": "\"Woods, Jane\""
  },
  { "itemtype": "comment", "comment": "\n%references\n" },
  {
    "itemtype": "entry",
    "type": "inproceedings",
    "enclosed": "braces",
    "key": "Smith2009",
    "fields": [
      { "name": "author", "value": "jane", "datatype": "identifier", "raw": "jane" },
      { "name": "year", "value": 2009, "datatype": "number", "raw": "2009" },
      { "name": "month", "value": "dec", "datatype": "identifier", "raw": "dec" },
      {
        "name": "title",
        "value": "{Quantum somethings}",
        "datatype": "braced",
        "raw": "{{Quantum somethings}}"
      },
      { "name": "journal", "value": "Journal of {B}lah", "datatype": "braced", "raw": "{Journal of {B}lah}" }
    ],
    "fileLocation": {
      "start": {"offset": 113, "line": 5, "column": 16},
      "end": {"offset": 227, "line": 11, "column": 1}
    },
    "raw": "@inproceedings{Smith2009,\n  author=jane,\n  year=2009,\n  month=dec,\n  title={{Quantum somethings}},\n  journal={Journal of {B}lah}\n}"
  },
  { "itemtype": "comment", "comment": "\n\n" },
  {
    "itemtype": "entry",
    "type": "book",
    "enclosed": "braces",
    "key": "IP:1990",
    "fields": [
      {
        "name": "author",
        "value": [
          { "value": "ian", "datatype": "identifier", "raw": "ian" },
          { "value": " and ", "datatype": "quoted", "raw": "\" and \"" },
          { "value": "jane", "datatype": "identifier", "raw": "jane" }
        ],
        "datatype": "concatinate",
        "raw": "ian # \" and \" # jane"
      },
      { "name": "year", "value": "1990", "datatype": "braced", "raw": "{1990}" },
      {
        "name": "title",
        "value": "Methods for Research",
        "datatype": "braced",
        "raw": "{Methods for Research}"
      }
    ],
    "fileLocation": {
      "start": {"offset": 236, "line": 13, "column": 7},
      "end": {"offset": 322, "line": 17, "column": 1}
    },
    "raw": "@book{IP:1990,\nauthor = ian # \" and \" # jane,\nyear = {1990},\ntitle = {Methods for Research}\n}"
  }
]
```

## Resources

- A summary of BibTex - http://maverick.inria.fr/~Xavier.Decoret/resources/xdkbibtex/bibtex_summary.html
- ORCID bibtex parse library - https://github.com/ORCID/bibtexParseJs
