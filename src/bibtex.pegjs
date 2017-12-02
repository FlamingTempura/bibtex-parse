start
	= entries:entry* { return [].concat(...entries); }
	
entry
	= _* '@' type:key _* '{' _* id:id _* ',' properties:properties ','? _* '}' _* 
	  { return [{ type: type.toLowerCase(), id, properties }]; }
	/ comment { return []; }
	
id
	= str:[-:+*/!@%^&=.a-zA-Z0-9_]+ { return str.join(''); }

properties
	= head:property ',' tail:properties { return Object.assign(head, tail); }
	/ head:property { return head; }
	
property
	= _* key:key _* '=' _* val:value _* { return { [key.toLowerCase()]: val }; }
	
key
	= letters:[a-zA-Z]+ { return letters.join(''); }

value
	= '{' value:braced '}' { return { value, brace: 'curly' }; }
	/ '"' value:[^"]* '"' { return { value: value.join(''), brace: 'quote' }; }
	/ value:[0-9]+ { return { value: Number(value.join('')), brace: 'none' }; }
	/ value:key { return { value, brace: 'none' }; }

braced
	= head:[^{}]* '{' braced:braced '}' tail:braced { return head.join('') + `{${braced}}` + tail; }
	/ head:[^{}]* { return head.join(''); }

_
	= w:[ \t\n\r]+ 
	
comment
	=  '%' [^\r\n]*