var assert = require('assert');
var bparser = require('../index.js');

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

});

describe('parse function', function() {
  it('Should parse a simple query without any brackets', function() {
    assert.deepEqual([['a', 'b']], bparser.parseBooleanQuery('a AND b'));
    assert.deepEqual([['a'], ['b']], bparser.parseBooleanQuery('a OR b'));
  });

});
