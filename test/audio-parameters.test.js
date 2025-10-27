/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const addPath = require("../src/add-path");
const {
  AudioParameters,
  convertAacProfile,
  convertChannels,
  convertSampleRate,
  makeCodingMode
} = require('../src/audio-parameters');

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

    const res = AudioParameters(audioParams);

    expect(res).toEqual(expected);
  });

  test('Vorbis conversion', () => {
    const audioParams = {
      "_path": [],
      "bitRate": "160",
      "channels": "2",
      "codec": "vorbis",
      "sampleRate": "44100"
    };

    const expected = {
      codecSettings: {
        codec: "VORBIS",
        vorbisSettings: {
          sampleRate: 44100,
          channels: 2
        }
      },
      audioSourceName: "Audio Selector 1"
    };

    const res = AudioParameters(audioParams);

    expect(res).toEqual(expected);
    expect(global.messages[0].message).toMatch(/MediaConvert does not support vorbis bitrate./);
  });
});

describe('convertSampleRate()', () => {
  beforeEach(() => {
    global.messages = [];
  });

  it('should use default when sample rate is auto and insert-defaults is true', () => {
    global.args = { 'insert-defaults': true };
    const tests = ['AAC', 'flac', 'mp2', 'mp3', 'pcm', 'vorbis'];
    for (const test of tests) {
      const audioParams = addPath({
        codec: test,
        sampleRate: 'auto',
      }, []);

      expect(convertSampleRate(audioParams)).toBeGreaterThan(0);
      expect(global.messages[0].level).toBe('WARN');
      expect(global.messages[0].message).toMatch('The converter has applied a static default value of');
      global.messages = [];
    }
  });

  it('should not use default when sample rate is auto and insert-defaults is false', () => {
    global.args = { 'insert-defaults': false };
    const audioParams = addPath({
      codec: test,
      sampleRate: 'auto',
    }, []);

    expect(convertSampleRate(audioParams)).toBeUndefined();
    expect(global.messages[0].level).toBe('ERROR');
    expect(global.messages[0].message).toMatch('no default value has been applied');
  });

  it('should use existing sample rate', () => {
    const audioParams = {
      codec: 'AAC',
      sampleRate: '44100',
    };

    expect(convertSampleRate(audioParams)).toBe(44100);
  });
});

describe('convertChannels()', () => {
  beforeEach(() => {
    global.messages = [];
  });

  it('should return undefined for AAC', () => {
    const audioParams = {
      codec: 'AAC',
      channels: '2',
    };

    expect(convertChannels(audioParams)).toBeUndefined();
  });

  it('should use default when channels is auto and insert-defaults is true', () => {
    global.args = { 'insert-defaults': true };
    const tests = ['flac', 'mp2', 'mp3', 'pcm', 'vorbis'];
    for (const test of tests) {
      const audioParams = addPath({
        codec: test,
        channels: 'auto',
      }, []);

      expect(convertChannels(audioParams)).toBe(2);
      expect(global.messages[0].level).toBe('WARN');
      expect(global.messages[0].message).toMatch('The converter has applied a static default value of');
      global.messages = [];
    }
  });

  it('should not use default when channels is auto and insert-defaults is false', () => {
    global.args = { 'insert-defaults': false };
    const audioParams = addPath({
      codec: test,
      channels: 'auto',
    }, []);

    expect(convertChannels(audioParams)).toBeUndefined();
    expect(global.messages[0].level).toBe('ERROR');
    expect(global.messages[0].message).toMatch('no default value has been applied');
  });

  it('should use existing sample rate', () => {
    const audioParams = {
      codec: 'mp3',
      channels: '2',
    };

    expect(convertChannels(audioParams)).toBe(2);
  });
});

describe('makeCodingMode()', () => {
  beforeEach(() => {
    global.messages = [];
  });

  it('should return undefined if codec is not AAC', () => {
    const tests = ['flac', 'mp2', 'mp3', 'pcm', 'vorbis'];
    for (const test of tests) {
      const audioParams = {
        codec: test,
        channels: '2',
      };
      expect(makeCodingMode(audioParams)).toBeUndefined();
    }
  });

  it('should return CODING_MODE_2_0 channels is auto and insert-defaults is true', () => {
    global.args = { 'insert-defaults': true };

    const audioParams = addPath({
      codec: 'AAC',
      channels: 'auto',
    }, []);

    expect(makeCodingMode(audioParams)).toBe('CODING_MODE_2_0');
    expect(global.messages[0].level).toBe('WARN');
    expect(global.messages[0].message).toMatch('The converter has applied a static default value of');
  });

  it('should not use default when channels is auto and insert-defaults is false', () => {
    global.args = { 'insert-defaults': false };
    const audioParams = addPath({
      codec: 'AAC',
      channels: 'auto',
    }, []);

    expect(makeCodingMode(audioParams)).toBeUndefined();
    expect(global.messages[0].level).toBe('ERROR');
    expect(global.messages[0].message).toMatch('no default value has been applied');
  });

  it('should use existing channels', () => {
    let audioParams = {codec: 'AAC', channels: '1'};
    expect(makeCodingMode(audioParams)).toBe('CODING_MODE_1_0');

    audioParams = {codec: 'AAC', channels: '2'};
    expect(makeCodingMode(audioParams)).toBe('CODING_MODE_2_0');
  });
});

describe('convertAacProfile()', () => {
  beforeEach(() => {
    global.messages = [];
  });

  it('should return undefined if codec is not AAC', () => {
    const tests = ['flac', 'mp2', 'mp3', 'pcm', 'vorbis'];
    for (const test of tests) {
      const audioParams = {
        codec: test
      };
      expect(convertAacProfile(audioParams)).toBeUndefined();
    }
  });

  it('should return LC if profile is auto and insert-defaults is true', () => {
    global.args = { 'insert-defaults': true };

    const audioParams = addPath({
      codec: 'AAC',
      codecOptions: {
        profile: 'auto'
      }
    }, []);

    expect(convertAacProfile(audioParams)).toBe('LC');
    expect(global.messages[0].level).toBe('WARN');
    expect(global.messages[0].message).toMatch('The converter has applied the LC profile');
  });

  it('should not use default when channels is auto and insert-defaults is false', () => {
    global.args = { 'insert-defaults': false };
    const audioParams = addPath({
      codec: 'AAC',
      codecOptions: {
        profile: 'auto'
      }
    }, []);

    expect(convertAacProfile(audioParams)).toBeUndefined();
    expect(global.messages[0].level).toBe('ERROR');
    expect(global.messages[0].message).toMatch('no default value has been applied');
  });

  it('should use existing channels', () => {
    let audioParams = {codec: 'AAC', codecOptions: {profile: 'AAC-LC'}};
    expect(convertAacProfile(audioParams)).toBe('LC');

    audioParams = {codec: 'AAC', codecOptions: {profile: 'HE-AAC'}};
    expect(convertAacProfile(audioParams)).toBe('HEV1');

    audioParams = {codec: 'AAC', codecOptions: {profile: 'HE-AACv2'}};
    expect(convertAacProfile(audioParams)).toBe('HEV2');
  });
});