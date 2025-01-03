/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const addPath = require("../src/add-path");
const JobOutput = require("../src/job-output");

beforeAll(() => {
  global.messages = [];
});

describe('JobOutput()', () => {
  it('should add name modifier for HLS output group', () => {
    global.presets = {'a': {}};

    const formats = ['HLSv3', 'HLSv4'];
    const output = {presetId: 'a'};

    for (const format of formats) {
      const res = JobOutput(output, format);
      expect(res.nameModifier.length).toBeGreaterThan(0);
    }
  });

  it('should make container settings', () => {
    global.presets = {'a': {}};
    const output = {presetId: 'a'};
    const res = JobOutput(output, 'HLSv4');
    expect(res.containerSettings.container).toBe('M3U8');
  });

  it('should make audio descriptions', () => {
    global.presets = {
      'a': {
        audio: {
          codec: 'AAC',
          codecOptions: {
            profile: 'AAC-LC'
          }
        }
      }
    };

    const output = {presetId: 'a'};
    const res = JobOutput(output, 'HLSv4');
    expect(res.audioDescriptions[0].codecSettings.codec).toBe('AAC');
  });

  it('should make video description', () => {
    global.presets = addPath({
      'a': {
        video: {
          codec: 'H.264',
          maxWidth: "854",
          maxHeight: "480",
          codecOptions: {
            profile: 'baseline',
            colorSpaceConversionMode: "None"
          }
        }
      }
    }, []);

    const output = {presetId: 'a'};
    const res = JobOutput(output);
    expect(res.videoDescription.codecSettings.codec).toBe('H_264');
  });
});
