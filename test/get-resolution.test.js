/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const getResolution = require("../src/get-resolution");

describe('getResolution()', () => {
  it('should return undefined when resolution is auto or malformed', () => {
    const tests = ['', '128', 'abc', '123x', 'auto', undefined, null, 1, true, false];

    for (const test of tests) {
      expect(getResolution(test)).toBeUndefined();
    }
  });

  it('should parse resolution', () => {
    const res = getResolution('128x96');
    expect(res.width).toBe(128);
    expect(res.height).toBe(96);
  });
});
