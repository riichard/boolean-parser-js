[![Build Status](https://travis-ci.org/riichard/boolean-parser-js.svg?branch=master)](https://travis-ci.org/riichard/boolean-parser-js) [![Join the chat at https://gitter.im/riichard/boolean-parser-js](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/riichard/boolean-parser-js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Boolean-parser

This function converts a boolean query to a 2 dimensional array with all possibilities. This allows you to quickly and easily see what scenarios will equal true in a complex boolean conditional.

#### Examples:

Input                         | Output
--------                      | ---------
`a AND b`                     | `[[a, b]]`
`a OR  b`                     | `[[a], [b]]`
`a AND b AND c`               | `[[a, b, c]]`
`a AND b OR  c`               | `[[a, b], [c]]`
`a AND (b OR c)`              | `[[a, b], [a, c]]`
`a AND (b OR c) AND (d OR e)` | `[[a, b, d], [a, b, e], [a, c, d], [a, c, e]]`

Whereas `a`, `b` and `c` represent words, forming a complex query pattern.

This function works recursively trough all brackets and generates an array of all possible combinations
of a matching query.

#### Long term example

###### Input:
```
((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j
```

###### Output:
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

## Use cases
This tool is great when constructing complex search filters that need to be matched with text. Creating search tools that need to show up more refined results than that would be possible with a simple `AND` combination.

## How does this library work
1. Parse string to an Array of OR items (strings). Everything that's in between brackets
will be treated as one word and will later be recursively parsed.
2. Go trough each string in that Array, and parse it to an array of AND items.
3. Recursively call the `parseBooleanQuery` function on whatever is in between
brackets. These recursive calls will return an array of all possible combinations
within those brackets. (An `OR` array of `AND` combinations)
4. Create an empty array called `nestedPaths`. And add all nested combinations that
are in between brackets to that array.
For instance, with the query:
```
((a AND (b OR c)) AND (d AND e) AND (f OR g OR h OR j)) AND x AND y AND z
```
Path will look like the following.
```javascript
// nestedPath =
[ [ [a,b], [a,c] ],
  [ [d,e] ],
  [ [f], [g], [h], [j] ] ]
```
5. Then push the remaining non-bracket AND terms to this array.
```javascript
// nestedPath =
[ [ [a,b], [a,c] ],
  [ [d,e] ],
  [ [f], [g], [h], [j] ]
  [ [x,y,z] ] ]
```
6. Then using the `orsAndMerge`, all those AND paths in those OR paths will be combined with the
other OR combinations.
In:
```
[
    [ [ a ], [ b ] ],
    [ [ c, d ], [ e ] ],
    [ [ f ] ]
]
```
Out:
```
[
    [ a, c, d, f ],
    [ b, c, d, f ],
    [ a, e, f ],
    [ b, e, f ]
]
```

7. Then we concatenate all those `OR` paths that were in between those `OR` terms
to one Array using the `mergeOrs` function.
In:
```
[
    [ [ a, b ], [ c ] ],
    [ [ d ] ],
    [ [ e ], [ f, g ] ]
]
```
Out:
```
[
    [ a, b ], [ c ], [ d ], [ e ], [ f, g ]
]
```
