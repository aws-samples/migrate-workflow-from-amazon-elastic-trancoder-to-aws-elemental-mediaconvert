/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const addPath = require('../src/add-path');

describe('addPath()', () => {
  it('should not add path if not object or array', () => {
    const tests = [1, true, 'abc', null, undefined];

    for (const test of tests) {
      const res = addPath(test, ['root']);
      expect(res).toBe(test);
    }
  });

  it('should add path to object', () => {
    const path = [];

    const obj = {
      a: {
        a1: 1
      },
      b: 2
    };

    const expected = {
      a: {
        a1: 1,
        _path: ['a']
      },
      b: 2,
      _path: []
    };

    const res = addPath(obj, path);

    expect(res).toEqual(expected);

    // Check that the function returns a new object
    expect(res).not.toBe(obj);
    expect(res).not.toEqual(obj);
    expect(Object.keys(obj).length).toBe(2);
  });

  it('should add path to array', () => {
    const path = [];

    const array = [
      {a: {}},
      {a: {}}
    ];

    const expected = [
      {_path: [0], a: {_path: [0, 'a']}},
      {_path: [1], a: {_path: [1, 'a']}},
    ];

    const res = addPath(array, path);

    expect(res).toEqual(expected);

    // Check that the function returns a new object
    expect(res).not.toBe(array);
    expect(res).not.toEqual(array);
  });
});
