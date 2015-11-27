[![Build Status](https://travis-ci.org/riichard/boolean-parser-js.svg?branch=master)](https://travis-ci.org/riichard/boolean-parser-js) [![Join the chat at https://gitter.im/riichard/boolean-parser-js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/riichard/boolean-parser-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Boolean-parser

This function converts a boolean query to a 2 dimensional array with all possibilities.
```
a AND (b OR c)
```

Becomes:
```
[[a, b],[a,c]]
```

Whereas a, b and c represent words, forming a complex query pattern.

This function works recursively trough all brackets and generates an array of all possible combinations
of a matching query.

#### More examples:

| -------- | --------- |
| Input:   | Output:   |
| -------- | --------- |
| a AND b  | [[a, b]]  |


| `a OR  b`        | `[[a], [b]]`     |
| `a AND b AND c`  | `[[a,b,c]]`      |
| `a AND b OR  c`  | `[[a,b],[c]]`    |
| `a AND (b OR c)` | `[[a, b],[a,c]]` |



```
((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j
```

#### Becomes:
```
[[a,b,d,e,f],
 [a,c,d,e,f],
 [a,b,d,e,g],
 [a,c,d,e,g],
 [a,b,d,e,h],
 [a,c,d,e,h],
 [i],
 [j]]
```

## Philosophy
The output is meant to be easily parsed to check for matches.
There are more efficient ways to check matches to this query by only checking each term once,
though this method is one that is easier to maintain and limits risk of side effects.
Especially when considering recursively nested queries involving many brackets
and AND/OR combinations.

## Installing
```
npm install boolean-parser
```

## Usage
```javascript
var booleanParser = require('boolean-parser');

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


