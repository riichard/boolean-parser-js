// (apple OR samsung) AND glass
// [text*=apple][text*=glass]
// [text*=samsung][text*=glass]

// (apple OR samsung) AND (glass OR screen)
// [text*=apple][text*=glass]
// [text*=apple][text*=screen]
// [text*=samsung][text*=glass]
// [text*=samsung][text*=screen]
//
// (apple OR samsung) AND (glass OR screen) AND battery
// [text*=apple][text*=glass][text*=battery+
// [text*=apple][text*=screen]
// [text*=samsung][text*=glass]
// [text*=samsung][text*=screen]
//
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
var searchPhrase = '((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j';

function parseBooleanSearch(searchPhrase) {
  //console.log('parseBooleanSearch called with: ', searchPhrase);

  // Remove outer brackets if they exist. EX: (a OR b) -> a OR b
  searchPhrase = removeOuterBrackets(searchPhrase);

  // remove double whitespaces
  //searchPhrase = searchPhrase.replace(/[\s]+/g, ' ');
  var ors = splitRoot('OR', searchPhrase);

  var orPath = ors.map(function(andQuery) {
    var ands = splitRoot('AND', andQuery);
    var nestedPaths = [];
    var andPath = [];

    for (var i = 0; i < ands.length; i++) {
      if (containsBrackets(ands[i])) {
        console.log(i, ands[i], parseBooleanSearch(ands[i]));
        nestedPaths.push(parseBooleanSearch(ands[i]));
      }
      else {
        andPath.push(ands[i]);
      }
    }

    // Merge the andPath and the nested OR paths together as one AND path
    nestedPaths.push(andPath);
    return orsAndMerge(nestedPaths);
  });

  return orPath;
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
  var result = Array.prototype.slice.call(a);
  for (var i = 0; i < b.length; i++) {
    result.push(b[i]);
  }

  return result;
}

function removeOuterBrackets(phrase) {
  return phrase.charAt(0) === '(' && phrase.charAt(phrase.length - 1) === ')' ?
    phrase.substring(1, phrase.length - 1) :
    phrase;
}

function containsBrackets(str) {
  return !!~str.search(/\(|\)/);
}

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

console.log('andAndMerge [ a, b, c, d] == ', andAndMerge(['a', 'b'], ['c', 'd']));
console.log('orAndOrMerge\na = [ [ a ], [ b ] ], \nb = [ [ c, d ], [ e, f ] ]:');
console.log(
  orAndOrMerge(
    [ [ 'a', 'b' ] ],
    [ [ 'c', 'd' ], [ 'e', 'f' ] ]
  ));

//console.log(removeOuterBrackets('(a OR b)'));

//console.log(parseBooleanSearch(searchPhrase));

//console.log(parseBooleanSearch('a AND b OR c'));
//console.log(parseBooleanSearch('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h))'));
