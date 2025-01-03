/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const AudioParameters = require('../src/audio-parameters');
const removeEmpty = require('../src/remove-empty');

describe('AudioParameters()', () => {
  test('Simple AAC conversion', () => {
    // Elastic Transcoder AudioParams object to convert.
    const audioParams = {
      "bitRate": "128",
      "channels": "2",
      "codec": "AAC",
      "codecOptions": {
        "profile": "AAC-LC"
      },
      "sampleRate": "44100"
    };

    // Expected MediaConvert AudioDescription object.
    const expected = {
      codecSettings: {
        codec: 'AAC',
        aacSettings: {
          sampleRate: 44100,
          bitrate: 128000,
          codingMode: 'CODING_MODE_2_0',
          codecProfile: 'LC'
        }
      },
      audioSourceName: "Audio Selector 1"
    };

    const res = removeEmpty(AudioParameters(audioParams));

    expect(res).toEqual(expected);
  });
});
