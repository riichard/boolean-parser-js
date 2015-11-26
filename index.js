// #######################################################
// How does this library work
// 1. Parse string to array of ORs (stuff between brackets count as one item
// and will later be recursively parsed)
// 2. Go trough each string in that array, and parse it to an array of ANDs
// 3. Recursively call this parsing function on whatever is in between
// brackets. These calls will return an array of all possible combinations
// within those brackets. (An OR array of AND combinations)
// 4. Create an empty array called `paths`.
// [ [a,b], [a,c] ],
// [ [d,e] ],
// [ [f], [g], [h] j
// And push the remaining non-bracket terms to this array in the same style
// [ [x,y,z] ]
// --- to ->
// [ [a,b,d,e,f,x,y,z], [a,b,d,e,g,x,y,z], [a,b,d,e,h,x,y,z],
//   [a,c,d,e,f,x,y,z], [a,c,d,e,g,x,y,z], [a,c,d,e,h,x,y,z] ]
// 6. Return the OR paths

// This function converts a boolean query to a 2 dimensional array.
// (a AND (b OR c)) -> [[a, b],[a,c]]
// This works recursively and generates an array of all possible combination
// of a matching  query.
// The output is meant to be easily parsed to see if there are any matches.
// There are more efficient ways to match content to this query, though this is
// the one that is most easy to maintain and limits risk of side-effects.
// Especially when considering recursively nested queries.
function parseBooleanQuery(searchPhrase) {
  console.log('parseBooleanQuery called with: ', searchPhrase);

  // Remove outer brackets if they exist. EX: (a OR b) -> a OR b
  searchPhrase = removeOuterBrackets(searchPhrase);
  console.log('after strip', searchPhrase);


  // remove double whitespaces
  searchPhrase = removeDoubleWhiteSpace(searchPhrase);

  var ors = splitRoot('OR', searchPhrase);
  var orPath = ors.map(function(andQuery) {
    var ands = splitRoot('AND', andQuery);
    var nestedPaths = [];
    var andPath = [];

    for (var i = 0; i < ands.length; i++) {
      if (containsBrackets(ands[i])) {
        console.log(i, ands[i], parseBooleanQuery(ands[i]));
        nestedPaths.push(parseBooleanQuery(ands[i]));
      }
      else {
        andPath.push(ands[i]);
      }
    }

    // Merge the andPath and the nested OR paths together as one AND path
    nestedPaths.push([andPath]);
    console.log('nestedPaths', nestedPaths);
    var mergedOrsAnd = orsAndMerge(nestedPaths);
    console.log('mergedOrsAnd', mergedOrsAnd);
    return mergedOrsAnd;
  });

  console.log('orPath', orPath);
  var mergedOrPath = mergeOrs(orPath);
  console.log('mergedOrPath', mergedOrPath);

  return mergedOrPath;
}

// Removes double whitespace in a string
// In: a b  c\nd
// Out: a b c d
function removeDoubleWhiteSpace(phrase) {
  return phrase.replace(/[\s]+/g, ' ');
}

// Merges 2 or paths together in an AND fashion
// in:
//  orPathA: [ [ a ], [ b ] ]
//  orPathB: [ [ c, d ], [ e ] ]
// out:
//  [
//    [ a, c, d ],
//    [ b, c, d],
//    [ a, e ],
//    [ b, e ]
//  ]
function orAndOrMerge(orPathA, orPathB) {
  var result = [];
  orPathA.forEach(function(andPathA) {
    orPathB.forEach(function(andPathB) {
      result.push(andAndMerge(andPathA, andPathB));
    });
  });

  return result;
}

// Merges multiple OR paths into one OR path, in an AND fashion
// in:
//  [
//    [ [ a ], [ b ] ],
//    [ [ c, d ], [ e ] ]
//    [ [ f ] ]
//  ]
// out:
//  [
//    [ a, c, d, f ],
//    [ b, c, d, f ],
//    [ a, e, f ],
//    [ b, e, f ]
//  ]
function orsAndMerge(ors) {
  var result = [[]];
  for (var i = 0; i < ors.length; i++) {
    result = orAndOrMerge(result, ors[i]);
  }

  return result;
}

// Removes duplicate and paths within an or path
// in:
//  [ [ a, b ], [ c ], [ a, b ] ]
// out:
//  [ [ a, b ], [ c ] ]
function deduplicateOr(orPath) {
}

// in -> x = [ a, b ], y = [ c, d ]
// out -> [ a, b, c, d ]
function andAndMerge(a, b) {
  return a.concat(b);
}

// Merges an array of OR queries, containing AND queries to a single OR query
// In:
// [ [ [ a, b ], [ c ] ],
//   [ [ d ] ],
//   [ [ e ], [ f, g ] ] ]
// Out:
// [ [ a, b ], [ c ], [ d ], [ e ], [ f, g ] ]
function mergeOrs(ors) {
  var result = ors[0];
  for (var i = 1; i < ors.length; i++) {
    result = result.concat(ors[i]);
  }

  return result;
}

// Removes the bracket at the beginning and end of a string. Only if they both
// exist. Otherwise it returns the original phrase.
function removeOuterBrackets(phrase) {
  return phrase.charAt(0) === '(' && phrase.charAt(phrase.length - 1) === ')' ?
    phrase.substring(1, phrase.length - 1) :
    phrase;
}

// Returns boolean true when string contains brackets '(' or ')', at any
// position within the string
function containsBrackets(str) {
  return !!~str.search(/\(|\)/);
}

// Splits a phrase into multiple strings by a split term. Like the split
// function.
// But then ignores the split terms that occur in between brackets
// IE: ( blah TERM blah )
function splitRoot(splitTerm, phrase) {
  var termSplit = phrase.split(' ' + splitTerm + ' ');
  var result = [];
  var tempNested = [];
  for (var i = 0; i < termSplit.length; i++) {

    // If we are dealing with a split in a nested query,
    // add it to tempNested, and rebuild the incorrectly parsed nested query
    // by putting split statement back where it was.
    if (containsBrackets(termSplit[i]) || tempNested.length > 0) {
      tempNested.push(termSplit[i]);

      // When the tempNested contains just as much opening brackets as closing
      // brackets, we can declare it as 'complete'.
      var tempNestedString =  '' + tempNested;
      console.log(tempNestedString);
      var countOpeningBrackets = (tempNestedString.match(/\(/g) || []).length;
      var countClosingBrackets = (tempNestedString.match(/\)/g) || []).length;
      console.log('opening: ', countOpeningBrackets, 'closing:', countClosingBrackets);

      // If the amouth of opening brackets is the same as the amount of
      // closing brackets, then the string is complete.
      if (countOpeningBrackets === countClosingBrackets) {
        result.push(tempNested.join(' ' + splitTerm + ' '));

        // Clear the tempNested for the next round
        tempNested = [];
      }
    }

    // In case we are NOT dealing with a nested query
    else {
      result.push(termSplit[i]);
    }
  }

  return result;
}

//console.log(parseBooleanQuery(searchPhrase));

//console.log(parseBooleanQuery('a AND b OR c'));
//console.log(parseBooleanQuery('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h))'));
module.exports = {
  andAndMerge: andAndMerge,
  orAndOrMerge: orAndOrMerge,
  orsAndMerge: orsAndMerge,
  mergeOrs: mergeOrs,
  splitRoot: splitRoot,
  removeDoubleWhiteSpace: removeDoubleWhiteSpace,
  removeOuterBrackets: removeOuterBrackets,
  parseBooleanQuery: parseBooleanQuery,
  containsBrackets: containsBrackets
};
