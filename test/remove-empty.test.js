/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const removeEmpty = require('../src/remove-empty');

describe('removeEmpty()', () => {
  it('should do nothing if param is not object or array', () => {
    const tests = [0, 1, true, false, 'abc'];

    for (const test of tests) {
      const res = removeEmpty(test);
      expect(res).toBe(test);
    }
  });

  it('should remove empty values', () => {
    const obj = {
      'a': null,
      'b': undefined,
      'c': NaN,
      'd': '',
      'e': 0
    };
    expect(removeEmpty(obj)).toEqual({e: 0});
  });

  it('should not remove non-empty values', () => {
    const obj = {
      'a': 0,
      'b': 1,
      'c': 1.1,
      'd': true,
      'e': false,
      'f': 'a'
    };
    expect(removeEmpty(obj)).not.toBe(obj);
    expect(removeEmpty(obj)).toEqual(obj);
  });

  it('should recursively remove empty values from objects', () => {
    const obj = {a: {a1: null, a2: 0}, b: '', c: 'c'};
    expect(removeEmpty(obj)).toEqual({a: {a2: 0}, c: 'c'});
  });

  it('should recursively remove empty values from arrays', () => {
    const obj = [{a: NaN, b: 0}, {a: 1, b: null}, {a: {a1: undefined}}];
    expect(removeEmpty(obj)).toEqual([{b: 0}, {a: 1}, {a: {}}]);
  });
});
