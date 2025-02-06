/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const addPath = require("../src/add-path");
const makeCodecSettings = require("../src/make-codec-settings");

describe('makeCodecSettings()', () => {
  beforeEach(() => {
    global.messages = [];
  });

  it('should use QVBR for H.264 when max bit rate is specified', () => {
    const videoParams = addPath({
      codec: 'H.264',
      bitRate: '10',
      codecOptions: {
        maxBitRate: '20',
        profile: 'baseline'
      }
    }, []);

    const res = makeCodecSettings(videoParams);
    expect(res.h264Settings.rateControlMode).toBe('QVBR');
    expect(res.h264Settings.bitrate).toBeUndefined();
  });

  it('should use CBR for H.264 when max bit rate is not specified', () => {
    const videoParams = addPath({
      codec: 'H.264',
      bitRate: '10',
      codecOptions: {
        profile: 'baseline'
      }
    }, []);

    const res = makeCodecSettings(videoParams);
    expect(res.h264Settings.rateControlMode).toBe('CBR');
    expect(res.h264Settings.bitrate).toBe(10000);
    expect(res.h264Settings.maxBitrate).toBeUndefined();
  });

  it('should use VBR for MPEG-2 when max bit rate is specified', () => {
    const videoParams = addPath({
      codec: 'mpeg2',
      bitRate: '10',
      codecOptions: {
        maxBitRate: '20'
      }
    }, []);

    const res = makeCodecSettings(videoParams);
    expect(res.mpeg2Settings.rateControlMode).toBe('VBR');
    expect(res.mpeg2Settings.bitrate).toBe(10000);
  });

  it('should use CBR for MPEG-2 when max bit rate is not specified', () => {
    const videoParams = addPath({
      codec: 'mpeg2',
      bitRate: '10',
      codecOptions: {}
    }, []);

    const res = makeCodecSettings(videoParams);
    expect(res.mpeg2Settings.rateControlMode).toBe('CBR');
    expect(res.mpeg2Settings.bitrate).toBe(10000);
    expect(res.mpeg2Settings.maxBitrate).toBeUndefined();
  });

  it('should use VBR for vp8 and vp9', () => {
    let videoParams = addPath({
      codec: 'vp8',
      bitRate: '10',
      codecOptions: {}
    }, []);

    let res = makeCodecSettings(videoParams);

    expect(res.vp8Settings.rateControlMode).toBe('VBR');
    expect(res.vp8Settings.bitrate).toBe(10000);


    videoParams = addPath({
      codec: 'vp9',
      bitRate: '10',
      codecOptions: {}
    }, []);

    res = makeCodecSettings(videoParams);

    expect(res.vp9Settings.rateControlMode).toBe('VBR');
    expect(res.vp9Settings.bitrate).toBe(10000);
  });

  it('should include framerate control', () => {
    const videoParams = addPath({
      codec: 'H.264',
      frameRate: '29.97',
      codecOptions: {
        profile: 'baseline'
      }
    }, []);

    const res = makeCodecSettings(videoParams);

    expect(res.h264Settings.framerateControl).toBe('SPECIFIED');
    expect(res.h264Settings.framerateNumerator).toBe(30000);
    expect(res.h264Settings.framerateDenominator).toBe(1001);
  });

  it('should not include framerate when framerate is auto', () => {
    const tests = [undefined, 'auto'];

    for (const test of tests) {
      const videoParams = addPath({
        codec: 'H.264',
        frameRate: test,
        codecOptions: {
          profile: 'baseline'
        }
      }, []);

      const res = makeCodecSettings(videoParams);

      expect(res.h264Settings.framerateControl).toBeUndefined();
      expect(res.h264Settings.framerateNumerator).toBeUndefined();
      expect(res.h264Settings.framerateDenominator).toBeUndefined();
    }
  });

  it('should convert interlace mode', () => {
    let videoParams = addPath({
      codec: 'H.264',
      codecOptions: {
        profile: 'baseline',
        interlacedMode: 'TopFirst'
      }
    }, []);

    let res = makeCodecSettings(videoParams);
    expect(res.h264Settings.interlaceMode).toBe('TOP_FIELD');


    videoParams = addPath({
      codec: 'H.264',
      codecOptions: {
        profile: 'baseline',
        interlacedMode: 'Progressive'
      }
    }, []);

    res = makeCodecSettings(videoParams);
    expect(res.h264Settings.interlaceMode).toBeUndefined();
  });
});

describe('H.264', () => {
  it('should convert H.264 profile', () => {
    const videoParams = addPath({
      codec: 'H.264',
      codecOptions: {
        profile: 'baseline'
      }
    }, []);

    const res = makeCodecSettings(videoParams);

    expect(res.h264Settings.codecProfile).toBe('BASELINE');
  });

  it('should convert H.264 level', () => {
    const videoParams = addPath({
      codec: 'H.264',
      codecOptions: {
        profile: 'baseline',
        level: '3.1'
      }
    }, []);

    const res = makeCodecSettings(videoParams);

    expect(res.h264Settings.codecLevel).toBe('LEVEL_3_1');
  });
});

describe('GIF', () => {
  it('should convert gif settings', () => {
    const videoParams = {
      codec: 'gif',
      frameRate: '15'
    };

    const res = makeCodecSettings(videoParams);

    expect(res.codec).toBe('GIF');
    expect(res.gifSettings).toBeDefined();
    expect(res.gifSettings.framerateControl).toBe('SPECIFIED');
    expect(res.gifSettings.framerateNumerator).toBe(15);
    expect(res.gifSettings.framerateDenominator).toBe(1);
  });

  it('should ignore bitrate', () => {
    const tests = ['400', undefined];

    for (const test of tests) {
      const videoParams = {
        codec: 'gif',
        bitRate: test,
        _path: []
      };

      const res = makeCodecSettings(videoParams);

      expect(res.gifSettings.bitrate).toBeUndefined();

      test && expect(global.messages.find(
        message => message.message.startsWith('MediaConvert does not support GIF bitrate')
      )).toBeDefined();
    }
  });

  it('should produce warning message for loop count', () => {
    const videoParams = {
      codec: 'gif',
      codecOptions: {
        loopCount: '1'
      },
      _path: []
    };

    const res = makeCodecSettings(videoParams);

    expect(global.messages.find(
      message => message.message.startsWith('MediaConvert does not support GIF loop count')
    )).toBeDefined();
  });
});
