start
	= commentsBefore:comment*
	  preamble:preamble?
	  entries:entry*
	  commentsAfter:comment* _* {
		return {
			commentsBefore,
			preamble: preamble,
			entries: [].concat(...entries),
			commentsAfter
		};
	}
	
entry "entry"
	= comments:comment* _* '@' type:key _* '{' _* id:key properties:properties ','? _* '}' _* ','? _*
	  { return [{ type: type.toLowerCase(), id, properties, comments }]; }

preamble "preamble"
	= _* '@preamble'i _* '{' _* value:value _* '}' _* ','? _*
      { return value; }

properties "properties"
	= head:property tail:properties { return Object.assign(head, tail); }
	/ head:property? { return head || {}; }
	
property "property"
	= _* ',' _* key:key _* '=' _* val:value _* { return { [key.toLowerCase()]: val }; }
	
key "key"
	= letters:[^=\n\t\r,{}\[\]]+ { return letters.join('').trim(); }

value "value"
	= '{' value:braced '}' { return { value, brace: 'curly' }; }
	/ '"' value:quoted* '"' { return { value: value.join(''), brace: 'quote' }; }
	/ value:[0-9]+ { return { value: Number(value.join('')), brace: 'none' }; }
	/ value:key { return { value, brace: 'none' }; }

braced "braced value"
	= head:[^{}]* '{' braced:braced '}' tail:braced { return head.join('') + `{${braced}}` + tail; }
	/ head:[^{}]* { return head.join(''); }

quoted "quoted"
	= '\\"' / [^"]

_ "whitespace"
	= w:[ \t\n\r]+ 
	
comment "comment"
	= _* '%' comment:[^\r\n]* lineend { return comment.join(''); }

lineend "end of line"
  = '\n' / '\r\n' / '\r' / '\u2028' / '\u2029'
