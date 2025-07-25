/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const addPath = require("../src/add-path");
const JobInput = require("../src/job-input");

describe('JobInput()', () => {
  beforeEach(() => {
    global.args = {};
    global.pipeline = {inputBucket: 'inputs'};
    global.messages = [];
  });

  it('should make fileInput S3 key', () => {
    const job = {};
    const input = {key: 'a.mp4'};
    const res = JobInput(job, input);
    expect(res.fileInput).toBe('s3://inputs/a.mp4');
  });

  it('should not make fileInput S3 key for template', () => {
    global.args = {name: 'abc'};
    const job = {};
    const input = {key: 'a.mp4'};
    const res = JobInput(job, input);
    expect(res.fileInput).toBeNull();
  });

  it('should make audio selector when outputs have audio', () => {
    const input = {key: 'a.mp4'};
    const outputs = [{presetId: '1351620000001-200060'}]; // Audio-only preset: hls_audio_160k.json
    const job = {outputs};
    let res = JobInput(job, input);
    expect(res.audioSelectors).toBeDefined();
  });

  it('should not make audio selector when outputs have no audio', () => {
    const input = {key: 'a.mp4'};
    const outputs = [{presetId: '1351620000001-200055'}]; // Video-only preset: hls_video_400k.json
    const job = {outputs};
    let res = JobInput(job, input);
    expect(res.audioSelectors).toBeNull();
  });

  it('should make caption selectors', () => {
    const input = {
      key: 'a.mp4',
      inputCaptions: {
        mergePolicy: 'MergeRetain'
      }
    };

    const outputs = [
      {
        presetId: '1351620000001-200055',
        captions: {
          captionFormats: [
            {
              format: "webvtt",
              pattern: "vtt-{language}"
            }
          ]
        }
      }
    ];

    const job = addPath({inputs: [input], outputs}, []);
    let res = JobInput(job, job.inputs[0]);
    expect(Object.entries(res.captionSelectors).length).toBeGreaterThan(0);
  });

  it('should make encryption settings', () => {
    // TODO
  });

  it('should make input clippings', () => {
    const job = {};
    const input = {
      timeSpan: {
        startTime: '2',
        duration: '2'
      }
    };
    const res = JobInput(job, input);
    expect(res.inputClippings.length).toBe(1);
  });
});
