/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { CaptionSource } = require("../src/caption-source");

describe('CaptionSource()', () => {
  beforeAll(() => {
    // Mock pipeline
    global.pipeline = {inputBucket: 'b'};
  });

  it('should return file source caption selector with correct source type', () => {
    const tests = [
      {key: 'a.scc',  type: 'SCC'},
      {key: 'a.srt',  type: 'SRT'},
      {key: 'a.ttml', type: 'TTML'},
      {key: 'a.vtt',  type: 'WEBVTT'},
    ];

    for (const test of tests) {
      // Elastic Transcoder captions source
      const captionSource = {key: test.key, label: 'a', language: 'en'};

      // The result MediaConvert captions selector object
      const res = CaptionSource(captionSource);

      expect(res.sourceSettings.sourceType).toBe(test.type);
    }
  });

  it('should construct proper sourceFile S3 key', () => {
    // Elastic Transcoder captions source
    const captionSource = {key: 'a.vtt', label: 'a', language: 'en'};

    // The result MediaConvert captions selector object
    const res = CaptionSource(captionSource);

    expect(res.sourceSettings.fileSourceSettings.sourceFile).toBe('s3://b/a.vtt');
  });

  it('should include timeDelta in milliseconds when timeOffset has fractional part', () => {
    // Elastic Transcoder captions source
    let captionSource = {key: 'a.vtt', label: 'a', language: 'en', timeOffset: '2.2'};

    // The result MediaConvert captions selector object
    let res = CaptionSource(captionSource);

    expect(res.sourceSettings.fileSourceSettings.timeDelta).toBe(2200);
    expect(res.sourceSettings.fileSourceSettings.timeDeltaUnits).toBe('MILLISECONDS');

    captionSource = {key: 'a.vtt', label: 'a', language: 'en', timeOffset: '1:2.2'};
    res = CaptionSource(captionSource);
    expect(res.sourceSettings.fileSourceSettings.timeDelta).toBe(62200);
    expect(res.sourceSettings.fileSourceSettings.timeDeltaUnits).toBe('MILLISECONDS');
  });

  it('should include timeDelta in seconds when timeOffset has no fractional part', () => {
    // Elastic Transcoder captions source
    let captionSource = {key: 'a.vtt', label: 'a', language: 'en', timeOffset: '2'};

    // The result MediaConvert captions selector object
    let res = CaptionSource(captionSource);

    expect(res.sourceSettings.fileSourceSettings.timeDelta).toBe(2);
    expect(res.sourceSettings.fileSourceSettings.timeDeltaUnits).toBe('SECONDS');

    captionSource = {key: 'a.vtt', label: 'a', language: 'en', timeOffset: '1:2'};
    res = CaptionSource(captionSource);
    expect(res.sourceSettings.fileSourceSettings.timeDelta).toBe(62);
    expect(res.sourceSettings.fileSourceSettings.timeDeltaUnits).toBe('SECONDS');
  });
});
