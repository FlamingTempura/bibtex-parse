/* jshint esversion: 6 */
const { test } = require('tap');
const { parse } = require('.');

test('parse', t => {
	t.plan(1);
	let result = parse(`
	% boo!
	@article{thing_a,
	  title={blah},
	  weird-key="{cheese} \\"in brie\\""
	}
	% another comment
	@inproceedings{Smith2009,
	  author="Caroline JA Smith",
	  year=2009,
	  month=dec,
	  title={{Quantum somethings}},journal={Journal of {B}lah}
	}@conference_at{4,
	  a__="{Caroline JA Smith}",
	  _#bo={Q{Uantum} {s}omethings},
	}
	% last thing
	% another last thing
	`);

	let expected = {
		commentsBefore: [' boo!'],
		preamble: null,
		entries: [{
				type: 'article',
				id: 'thing_a',
				properties: {
					title: { value: 'blah', brace: 'curly' },
					'weird-key': { value: '{cheese} \\"in brie\\"', brace: 'quote' }
				},
				comments: []
			},
			{
				type: 'inproceedings',
				id: 'Smith2009',
				properties: {
					author: { value: 'Caroline JA Smith', brace: 'quote' },
					year: { value: 2009, brace: 'none' },
					month: { value: 'dec', brace: 'none' },
					title: { value: '{Quantum somethings}', brace: 'curly' },
					journal: { value: 'Journal of {B}lah', brace: 'curly' }
				},
				comments: [' another comment']
			},
			{
				type: 'conference_at',
				id: '4',
				properties: {
					a__: { value: '{Caroline JA Smith}', brace: 'quote' },
					'_#bo': { value: 'Q{Uantum} {s}omethings', brace: 'curly' }
				},
				comments: []
			}
		],
		commentsAfter: [' last thing', ' another last thing']
	};

	t.same(result, expected);
});


test('error', t => {
	t.plan(3);
	try {
		let result = parse(`
		% boo!
		@article{thing_a,
		  title {blah},
		  weird-key="{cheese}"
		}
		`);
	} catch (e) {
		t.equal(e.name, 'SyntaxError');
		t.equal(e.location.start.line, 3);
		t.equal(e.location.start.column, 3);
	}
});