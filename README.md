![Travis CI](https://travis-ci.org/riichard/boolean-parser-js.svg?branch=master)

# Boolean-parser

This function converts a boolean query to a 2 dimensional array.
`(a AND (b OR c))` -> `[[a, b],[a,c]]`.

This works recursively and generates an array of all possible combinations
of a matching query.

## Philosophy
The output is meant to be easily parsed to see if there are any matches.
There are more efficient ways to match content to this query, though this is
the one that is most easy to maintain and limits risk of side effects.
Especially when considering recursively nested queries involving many brackets
and AND/OR combinations.


## Installing
```
npm install boolean-parser
```

## Usage
```
var booleanParser = require('booleanParser');

var searchPhrase = '((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j';

var parsedQuery = booleanParser.parseBooleanQuery(searchPhrase);
// Returns:
// [['a','b','d','e','f'],
//  ['a','b','d','e','g'],
//  ['a','b','d','e','h'],
//  ['a','c','d','e','f'],
//  ['a','c','d','e','g'],
//  ['a','c','d','e','h'],
//  ['i'],['j']]
```


