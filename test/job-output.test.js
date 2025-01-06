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
    const formats = ['HLSv3', 'HLSv4'];
    const output = {presetId: '1351620000001-200055'};

    for (const format of formats) {
      const res = JobOutput(output, format);
      expect(res.nameModifier.length).toBeGreaterThan(0);
    }
  });

  it('should make container settings', () => {
    const output = {presetId: '1351620000001-200055'};
    const res = JobOutput(output, 'HLSv4');
    expect(res.containerSettings.container).toBe('M3U8');
  });

  it('should make audio descriptions', () => {
    const output = {presetId: '1351620000001-200060'};
    const res = JobOutput(output, 'HLSv4');
    expect(res.audioDescriptions[0].codecSettings.codec).toBe('AAC');
  });

  it('should make video description', () => {
    const output = {presetId: '1351620000001-200055'}; // Video-only preset: hls_video_400k.json
    const res = JobOutput(output);
    expect(res.videoDescription.codecSettings.codec).toBe('H_264');
  });
});
