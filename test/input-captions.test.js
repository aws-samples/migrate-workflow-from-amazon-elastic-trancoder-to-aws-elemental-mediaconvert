/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const InputCaptions = require("../src/input-captions");

describe('InputCaptions()', () => {
  beforeAll(() => {
    global.messages = [];
    global.pipeline = {inputBucket: 'b'};
  });

  it('should return null when inputCaptions is undefined', () => {
    const outputs = [{
      captions: {
        captionFormats: [
          {
            format: "webvtt",
            pattern: "vtt-{language}"
          }
        ]
      }
    }];

    expect(InputCaptions(undefined, outputs)).toBeNull();
  });

  it('should return null when output has no captions', () => {
    const inputCaptions = {
      captionSources: [
        {
          key: "inputs/a.vtt",
          label: "en",
          language: "en",
          timeOffset: "00:01:00.111"
        },
      ],
      mergePolicy: 'MergeRetain'
    };
    const outputs = [{}];

    expect(InputCaptions(inputCaptions, outputs)).toBeNull();
  });

  it('should make embedded captions selector when merging policy contains Merge', () => {
    const mergingPolicies = ['MergeRetain', 'MergeOverride'];

    for(const mergePolicy of mergingPolicies) {
      const inputCaptions = {mergePolicy, _path: []};

      const outputs = [{
        captions: {
          captionFormats: [
            {
              format: "webvtt",
              pattern: "vtt-{language}"
            }
          ]
        }
      }];

      const res = InputCaptions(inputCaptions, outputs);
      const entries = Object.entries(res);
      const embedded = entries.find(e => e[1].sourceSettings.sourceType === 'EMBEDDED');
      expect(embedded).toBeDefined();
    }
  });

  it('should make embedded and sidecar captions selector when merging policy contains Merge', () => {
    const mergingPolicies = ['MergeRetain', 'MergeOverride'];

    for(const mergePolicy of mergingPolicies) {
      const inputCaptions = {
        captionSources: [
          {
            key: "inputs/a.vtt",
            label: "en",
            language: "en",
            timeOffset: "00:01:00.111"
          },
        ],
        mergePolicy,
        _path: []
      };

      const outputs = [{
        captions: {
          captionFormats: [
            {
              format: "webvtt",
              pattern: "vtt-{language}"
            }
          ]
        }
      }];

      const res = InputCaptions(inputCaptions, outputs);
      const entries = Object.entries(res);
      const embedded = entries.find(e => e[1].sourceSettings.sourceType === 'EMBEDDED');
      const sidecar = entries.find(e => e[1].sourceSettings.sourceType === 'WEBVTT');
      expect(embedded).toBeDefined();
      expect(sidecar).toBeDefined();
    }
  });

  it('should not make embedded captions selector when merging policy is override', () => {
    const inputCaptions = {
      captionSources: [
        {
          key: "inputs/a.vtt",
          label: "en",
          language: "en",
          timeOffset: "00:01:00.111"
        },
      ],
      mergePolicy: 'Override',
      _path: []
    };

    const outputs = [{
      captions: {
        captionFormats: [
          {
            format: "webvtt",
            pattern: "vtt-{language}"
          }
        ]
      }
    }];

    const res = InputCaptions(inputCaptions, outputs);
    const entries = Object.entries(res);
    const embedded = entries.find(e => e[1].sourceSettings.sourceType === 'EMBEDDED');
    const sidecar = entries.find(e => e[1].sourceSettings.sourceType === 'WEBVTT');
    expect(embedded).toBeUndefined();
    expect(sidecar).toBeDefined();
  });
});
