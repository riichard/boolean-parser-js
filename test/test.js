var assert = require('assert');
var bparser = require('../index.js');

function recursiveSort(arr){
  if (typeof arr  === 'string') return arr;

  // Lets make a copy so we don't edit the original array
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    result.push(recursiveSort(arr[i]));
  }

  return result.sort();
}

describe('Test utilities', function() {
  describe('recursiveSort()', function() {
    it('should sort an array recursively', function() {

      assert.deepEqual(
        [['a', 'b', ['c', 'd', 'e', 'f']], ['i'], ['j'], 'x'],
        recursiveSort(
          ['x', ['j'], ['i'], ['b', 'a', ['f', 'd', 'e', 'c']]]
        )
      );
    });
  });
});

describe('String functions', function() {
  describe('containsBrackets()', function() {
    it('should return true when brackets are present at the beginning OR end of the string', function() {
      assert.equal(true, bparser.containsBrackets('(a b)'));
      assert.equal(true, bparser.containsBrackets('a b)'));
      assert.equal(true, bparser.containsBrackets('(a b'));
    });

    it('should return false when brackets are not present', function() {
      assert.equal(false, bparser.containsBrackets('a b'));
    });
  });

  describe('removeOuterBrackets()', function() {
    it('should only remove the bracket at the beginning of the string, and at the end of the string, when both are present', function() {
      assert.equal('richard katie', bparser.removeOuterBrackets('(richard katie)'));
    });

    it('should not remove the brackets when only one bracket is present', function() {
      assert.equal('(richard katie', bparser.removeOuterBrackets('(richard katie'));
    });

    it('should not remove the brackets when one of the two brackets is inside the string', function() {
      assert.equal('(richard ) katie', bparser.removeOuterBrackets('(richard ) katie'));
    });

    it('should not remove the closing brackets, when the last character is a bracket, but is not related to the first character bracket', function() {
      assert.equal('(a OR b) AND (c OR d)',
                   bparser.removeOuterBrackets('(a OR b) AND (c OR d)'));
    });
  });

  describe('splitRoot()', function() {
    it('should split the phrase into multiple strings based on a split term, while ignoring the terms in between brackets', function() {
      assert.deepEqual(
        ['a', 'b'],
        bparser.splitRoot('OR', 'a OR b')
      );
      assert.deepEqual(
        ['a', 'b AND (c OR d)'],
        bparser.splitRoot('OR', 'a OR b AND (c OR d)')
      );
      assert.deepEqual(
        ['a', 'b'],
        bparser.splitRoot('AND', 'a AND b')
      );
    });
  });

  describe('removeDoubleWhiteSpace', function() {
    it('Should remove double spacebars', function() {
      assert.equal('a b c', bparser.removeDoubleWhiteSpace('a  b c'));
    });

    it('Should remove double spacebars at multiple locations', function() {
      assert.equal('a b c', bparser.removeDoubleWhiteSpace('a  b  c'));
    });

    it('Should convert linebreaks and tabs to a single space', function() {
      assert.equal('a b c', bparser.removeDoubleWhiteSpace("a\nb\tc"));
    });
  });
  
	describe('escapeCharactersInQuotes', function() {
    it('Should modify inside quotes to have no spaces', function() {
      assert.equal('a %22b%20c%22', bparser.escapeCharactersInQuotes('a "b c"'));
    });

    it('Should modify inside quotes to have no parenthesis', function() {
      assert.equal('a %22&#40;b-c&#41;%22', bparser.escapeCharactersInQuotes('a "(b-c)"'));
    });

    it('Should modify multiple sets of quotes', function() {
      assert.equal('a %22b%20c%22 d %22e%20f%22 g', bparser.escapeCharactersInQuotes('a "b c" d "e f" g'));
    });
    
		it('Should ignore dangling quotes', function() {
      assert.equal('a "b c', bparser.escapeCharactersInQuotes('a "b c'));
    });
  });

	describe('unescapeCharactersInQuotes', function() {
    it('Should restore spaces in terms', function() {
      assert.deepEqual([['a'],['b c']], bparser.unescapeCharactersInQuotes([['a'],['%22b%20c%22']]));
    });

    it('Should restore parenthesis in terms', function() {
      assert.deepEqual([['a'],['(b-c)']], bparser.unescapeCharactersInQuotes([['a'],['%22&#40;b-c&#41;%22']]));
    });

    it('Should restore multiple sets of quotes', function() {
      assert.deepEqual([['a'],['b c'],['d'],['e f'],['g']], bparser.unescapeCharactersInQuotes([['a'],['%22b%20c%22'],['d'],['%22e%20f%22'],['g']]));
    });
    
		it('Should ignore dangling quotes', function() {
      assert.deepEqual([['a'],['"b'],['c']], bparser.unescapeCharactersInQuotes([['a'],['"b'],['c']]));
    });
  });

  describe('injectOperatorBetweenTerms()', function() {
    it('should add in additional ANDs to the searchPhrase by default', function() {
      assert.equal('a AND b', bparser.injectOperatorBetweenTerms('a b'));
      assert.equal('a AND b', bparser.injectOperatorBetweenTerms('a AND b'));
      assert.equal('a OR b', bparser.injectOperatorBetweenTerms('a OR b'));
      assert.equal('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j', bparser.injectOperatorBetweenTerms(' ( ( a AND ( b OR c ) ) AND ( d AND e ) AND ( f OR g OR h ) ) OR i OR j '));
      assert.equal('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j', bparser.injectOperatorBetweenTerms('((a ( b OR c)) (d e) (f OR g OR h)) OR i OR j'));
    });

    it('should add in ORs to the searchPhrase, if specified', function() {
			// Save off the old split term and override it to 'OR'
			var oldSplitTerm = bparser.defaultSplitTerm;
			bparser.defaultSplitTerm = 'OR';
      assert.equal('a OR b', bparser.injectOperatorBetweenTerms('a b'));
      assert.equal('a AND b', bparser.injectOperatorBetweenTerms('a AND b'));
      assert.equal('a OR b', bparser.injectOperatorBetweenTerms('a OR b'));
      assert.equal('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j', bparser.injectOperatorBetweenTerms(' ( ( a AND ( b OR c ) ) AND ( d AND e ) AND ( f OR g OR h ) ) OR i OR j '));
      assert.equal('((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j', bparser.injectOperatorBetweenTerms('((a AND (b c)) AND (d AND e) AND (f g h)) i j'));
			// Restore the old split term
			bparser.defaultSplitTerm = oldSplitTerm;
    });
  });
});

describe('query merging functions', function() {
  describe('andAndMerge()', function() {
    it('two non-empty AND queries', function() {
      assert.deepEqual('a,b,c,d'.split(','), bparser.andAndMerge(['a', 'b'], ['c', 'd']));
    });

    it('one non-empty, and one empty AND queries', function() {
      assert.deepEqual('a,b'.split(','), bparser.andAndMerge(['a', 'b'], []));
    });

    it('one empty, and one non-empty AND queries', function() {
      assert.deepEqual('a,b'.split(','), bparser.andAndMerge([], ['a', 'b']));
    });
  });

  describe('orAndOrMerge()', function() {
    it('two non-empty OR queries, with one AND', function() {
      assert.deepEqual(
        [['a', 'c', 'd'],
         ['b', 'c', 'd'],
         ['a', 'e'],
         ['b', 'e']].sort(),
        bparser.orAndOrMerge(
          [['a'], ['b']],
          [['c', 'd'], ['e']]
        ).sort()
      );
    });
  });

  describe('orAndOrMerge()', function() {
    it('Merges multile OR paths into one OR path, in an AND fashion', function() {
      assert.deepEqual(
        [
          ['a', 'c', 'd', 'f'],
          ['b', 'c', 'd', 'f'],
          ['a', 'e', 'f'],
          ['b', 'e', 'f']
        ].sort(),
        bparser.orsAndMerge(
          [
            [['a'], ['b']],
            [['c', 'd'], ['e']],
            [['f']]
          ]
        ).sort()
      );
    });
  });

  describe('mergeOrs()', function() {
    it('Should merge a list of multilple sets of OR queries containing and queries', function() {
      assert.deepEqual(
        [['a', 'b'], ['c'], ['d'], ['e'], ['f', 'g']].sort(),
        bparser.mergeOrs(
           [[['a', 'b'], ['c']],
            [['d']],
            [['e'], ['f', 'g']]].sort()
        )
      );
    });
  });

  describe('deduplicateOr()', function() {
    it('Should remove duplicate and-paths within an or-path', function() {
      assert.deepEqual(
        [ [ 'a', 'b' ], [ 'c' ] ],
        bparser.deduplicateOr(
          [ [ 'a', 'b' ], [ 'c' ], [ 'a', 'b' ], [ 'b', 'a' ] ]
        )
      );
    });
    it('Should remove duplicate and-paths within an or-path (order matters)', function() {
      assert.deepEqual(
        [ [ 'a', 'b' ], [ 'c' ], [ 'b', 'a' ] ],
        bparser.deduplicateOr(
           [ [ 'a', 'b' ], [ 'c' ], [ 'a', 'b' ], [ 'b', 'a' ] ],
           true
        )
      );
    });
  });
});

describe('parse function', function() {
  it('Should parse a simple query without an operator', function() {
    assert.deepEqual([['a', 'b']], bparser.parseBooleanQuery('a b'));
    assert.deepEqual([['a', 'b','c']], bparser.parseBooleanQuery('a AND b c'));
    assert.deepEqual([['a','b c']], bparser.parseBooleanQuery('a "b c"'));
  });
  it('Should parse a simple query without any brackets', function() {
    assert.deepEqual([['a', 'b']], bparser.parseBooleanQuery('a AND b'));
    assert.deepEqual([['a'], ['b']], bparser.parseBooleanQuery('a OR b'));
    assert.deepEqual([['a', 'b'], ['c']], bparser.parseBooleanQuery('a AND b OR c'));
    assert.deepEqual([['a'], ['b', 'c']], bparser.parseBooleanQuery('a OR  b AND c'));
  });
  it('Should parse a simple query accidental whitespace', function() {
    assert.deepEqual([['a'], ['b','c']], bparser.parseBooleanQuery('a OR  b AND c'));
  });
  it('Should parse a simple query a single depth of brackets', function() {
    assert.deepEqual([['a', 'c'], ['b', 'c']], bparser.parseBooleanQuery('(a OR b) AND c'));
  });
  it('Should parse a simple query a query with quoted terms', function() {
    assert.deepEqual([['a', 'c'], ['b', 'c']], bparser.parseBooleanQuery('("a" OR b) AND c'));
  });
  it('Should parse a more complex query a query with quoted terms', function() {
    assert.deepEqual([['a b', 'e f'], ['c', 'e f']], bparser.parseBooleanQuery('("a b" OR c) AND "e f"'));
  });

  // This resolves to issue #3 on github
  it('Should parse a query, where the final bracket is not related to the first bracket', function() {
    assert.deepEqual(
      recursiveSort(
        [ ['a','c'], ['b','c'],
          ['a','d'], ['b','d']]),
      recursiveSort(
        bparser.parseBooleanQuery('(a OR b) AND (c OR d)')
      )
    );
    assert.deepEqual(
      [['a','c','x'], ['b','c','x'],
       ['a','d','x'], ['b','d','x']].sort(),
      bparser.parseBooleanQuery('x AND (a OR b) AND (c OR d)').sort()
    );
  });
  it('..long shot', function(){
    var searchPhrase = '((a AND (b OR c)) AND (d AND e) AND (f OR g OR h)) OR i OR j';
    assert.deepEqual(
      recursiveSort(
      [['a','b','d','e','f'],
       ['a','b','d','e','g'],
       ['a','b','d','e','h'],
       ['a','c','d','e','f'],
       ['a','c','d','e','g'],
       ['a','c','d','e','h'],
       ['i'],['j']]),
      recursiveSort(bparser.parseBooleanQuery(searchPhrase))
    );
  });
  it('..long shot with quotes', function(){
    var searchPhrase = '(("a " AND ("(b" OR "c)")) AND ("d AND" AND "e OR") AND ("(f)" OR g OR h)) OR i OR j';
    assert.deepEqual(
      recursiveSort(
      [['a ','(b','d AND','e OR','(f)'],
       ['a ','(b','d AND','e OR','g'],
       ['a ','(b','d AND','e OR','h'],
       ['a ','c)','d AND','e OR','(f)'],
       ['a ','c)','d AND','e OR','g'],
       ['a ','c)','d AND','e OR','h'],
       ['i'],['j']]),
      recursiveSort(bparser.parseBooleanQuery(searchPhrase))
    );
  });

});
