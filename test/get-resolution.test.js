/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const getResolution = require("../src/get-resolution");

describe('getResolution()', () => {
  it('should parse maxWidth and maxHeight', () => {
    const tests = [
      {maxWidth: 'auto', maxHeight: 'auto', width: null, height: null},
      {maxWidth: '128',  maxHeight: 'auto', width: 128,  height: null},
      {maxWidth: 'auto', maxHeight: '96',   width: null, height: 96},
      {maxWidth: '128',  maxHeight: '96',   width: 128,  height: 96},
    ];

    for (const test of tests) {
      const videoParams = {maxWidth: test.maxWidth, maxHeight: test.maxHeight};
      const res = getResolution(videoParams);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(test.width);
      expect(res[1]).toBe(test.height);
    }
  });

  it('should parse resolution', () => {
    const tests = [
      {resolution: 'auto',   width: null, height: null},
      {resolution: '128x96', width: 128,  height: 96},
    ];

    for (const test of tests) {
      const videoParams = {resolution: test.resolution};
      const res = getResolution(videoParams);
      expect(res.length).toBe(2);
      expect(res[0]).toBe(test.width);
      expect(res[1]).toBe(test.height);
    }
  });
});
