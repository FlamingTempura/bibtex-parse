start
	= _* items:item* _* { return items; }

item "item"
	= preamble:preamble { return { type: 'preamble', preamble }; }
    / entry:entry { return { ...entry }; }
    / content:string { return { type: 'string', ...content }; }
    / comments:comment+ { return { type: 'comment', comment:comments.join('') }; }

comment "comment"
	= comment:[^@]+ { return comment.join(''); } // any text outside of an entry is interpreted as a comment, but it must not contain an @
    / '@comment'i _* '{' braced '}' { return text(); } // anything can be in a @comment{}
    / '@comment'i { return text(); } // @comment on it's own is allowed
    
string "string"
    = '@string'i _* '(' _* key:key _* '=' _* value:value _* ')' { return { key, value }; }
    / '@string'i _* '{' _* key:key _* '=' _* value:value _* '}' { return { key, value }; }

preamble "preamble"
	= '@preamble'i _* '(' value:value ')' { return value; }
    / '@preamble'i _* '{' value:value '}' { return value; }

entry "entry"
	= '@' type:key!{return type.toLowerCase() === 'comment'} _* '{' _* id:key properties:properties ','? _* '}'
	  { return { type: type.toLowerCase(), id, properties }; }
      
properties "properties"
	= head:property tail:properties { return Object.assign(head, tail); }
	/ head:property? { return head || {}; }
	
property "property"
	= _* ',' _* key:key _* '=' _* val:value _* { return { [key.toLowerCase()]: val }; }
	
key "key"
	= letters:[^=\n\t\r,{}\[\]]+ { return letters.join('').trim(); }

value "value"
	= '{' value:braced '}' { return { value, enclosed: 'curly' }; }
    / values:concatinate { return values.length === 1 ? values[0] : { concatinate: values }; }

concatinate
	= left:literal _* "#" _* right:concatinate { return [left].concat(right); }
	/ left:literal { return [left]; }

literal
	= '"' value:quoted* '"' { return { value: value.join(''), enclosed: 'quote' }; }
	/ value:[0-9]+ { return { value: Number(value.join('')), enclosed: null }; }
	/ value:key { return { value, enclosed: null }; }

integer "integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

braced "braced"
	= head:[^{}]* '{' braced:braced '}' tail:braced { return head.join('') + `{${braced}}` + tail; }
	/ head:[^{}]* { return head.join(''); }

quoted "quoted"
	= '\\"' / [^"]

_ "whitespace"
	= w:[ \t\n\r]+ 

lineend "end of line"
  = '\n' / '\r\n' / '\r' / '\u2028' / '\u2029' / !. // !. is end of file
