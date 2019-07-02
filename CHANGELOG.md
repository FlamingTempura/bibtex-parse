#v1.0.0

Now supports @Comment and comments without % prefixed. 

Breaking changes:
* parse() now returns a list instead of an object. The list includes entries, preambles, strings, and entries.
* property values now have a "enclosed" key instead of a "brace" key. Enclosed may be "brace", "quote", or null.