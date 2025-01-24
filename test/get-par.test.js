/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const {
  getParFromAspectRatio,
  getParFromDisplayAspectRatio,
  darToPar,
  getPar,
  gcd
} = require("../src/get-par");

describe('getPar()', () => {
  it('should return undefined if videoParams is not undefined', () => {
    const tests = [undefined, null];

    for (const test of tests) {
      expect(getPar(test)).toBeUndefined();
    }
  });

  it('should get PAR from display aspect ratio over aspect ratio', () => {
    let videoParams = {
      maxWidth: '1280',
      maxHeight: '720',
      displayAspectRatio: '16:9',
      resolution: '200x200',
      aspectRatio: '4:3',
      paddingPolicy: 'Pad',
      _path: []
    };

    let res = getPar(videoParams);

    expect(res.parNumerator).toBe(1);
    expect(res.parDenominator).toBe(1);

    videoParams = {
      displayAspectRatio: '16:9',
      resolution: '200x200',
      aspectRatio: '4:3',
      paddingPolicy: 'Pad',
      _path: []
    };

    res = getPar(videoParams);

    expect(res.parNumerator).toBe(4);
    expect(res.parDenominator).toBe(3);
  });
});

describe('getParFromAspectRatio()', () => {
  it('should return undefined when aspectRatio is auto or not defined', () => {
    const tests = [undefined, 'auto', '0:0', '-4:-3', 123];

    for (const test of tests) {
      const videoParams = {aspectRatio: test, _path: []};
      expect(getParFromAspectRatio(videoParams)).toBeUndefined();
    }
  });

  it('should return undefined when resolution is not defined', () => {
    // Video resolutions
    const tests = [undefined, '', '0x0', '-200x-200'];

    for (const test of tests) {
      const videoParams = {
        aspectRatio: '16:9',
        maxWidth: '1280',
        maxHeight: '720',
        resolution: test,
        _path: []
      };

      expect(getParFromAspectRatio(videoParams)).toBeUndefined();
    }
  });

  it('should return PAR', () => {
    const videoParams = {
      aspectRatio: '16:9',
      resolution: '1280x720'
    };

    const res = getParFromAspectRatio(videoParams);

    expect(res.parNumerator).toBe(1);
    expect(res.parDenominator).toBe(1);
  });
});

describe('getParFromDisplayAspectRatio()', () => {
  it('should return undefined when displayAspectRatio is auto or not defined', () => {
    const tests = [undefined, 'auto', '0:0', '-4:-3', 123];

    for (const test of tests) {
      const videoParams = {displayAspectRatio: test, _path: []};
      expect(getParFromDisplayAspectRatio(videoParams)).toBeUndefined();
    }
  });

  it('should return undefined when maxWith or maxHeight is not defined', () => {
    let tests = [
      {maxWidth: undefined, maxHeight: undefined},
      {maxWidth: '1280',    maxHeight: undefined},
      {maxWidth: undefined, maxHeight: '720'},
      {maxWidth: '0',       maxHeight: '0'},
      {maxWidth: '-400',    maxHeight: '200'},
      {maxWidth: '400',     maxHeight: '-200'},
      {maxWidth: '-400',    maxHeight: '-200'},
    ];

    for (const test of tests) {
      let videoParams = {
        displayAspectRatio: '16:9',
        maxWidth: test.maxWidth,
        maxHeight: test.maxHeight,
        _path: []
      };

      expect(getParFromDisplayAspectRatio(videoParams)).toBeUndefined();
    }
  });

  it('should return PAR', () => {
    const videoParams = {
      displayAspectRatio: '16:9',
      maxWidth: '1280',
      maxHeight: '720',
      paddingPolicy: 'Pad'
    };

    const res = getParFromDisplayAspectRatio(videoParams);

    expect(res.parNumerator).toBe(1);
    expect(res.parDenominator).toBe(1);
  });
});

describe('darToPar()', () => {
  it('should return PAR', () => {
    const tests = [
      {w: 200,  h: 200, dw: 2,  dh: 1, par: {parNumerator: 2,  parDenominator: 1}},
      {w: 1280, h: 720, dw: 16, dh: 9, par: {parNumerator: 1,  parDenominator: 1}},
      {w: 1,    h: 3,   dw: 5,  dh: 7, par: {parNumerator: 15, parDenominator: 7}},
    ];

    for (const test of tests) {
      expect(darToPar(test.w, test.h, test.dw, test.dh)).toEqual(test.par);
    }
  })
});

describe('gcd()', () => {
  it('should compute gcd', () => {
    const tests = [
      {a: 0,    b: 0,    expected: 0},
      {a: 0,    b: 1,    expected: 1},
      {a: 1,    b: 0,    expected: 1},
      {a: 2,    b: 2,    expected: 2},
      {a: 2,    b: 4,    expected: 2},
      {a: 3,    b: 5,    expected: 1},
      {a: 30,   b: 42,   expected: 6},
      {a: 8000, b: 5000, expected: 1000},
    ];

    for (const test of tests) {
      const {a, b, expected} = test;
      expect(gcd(a, b)).toBe(expected);
    }
  });
});
