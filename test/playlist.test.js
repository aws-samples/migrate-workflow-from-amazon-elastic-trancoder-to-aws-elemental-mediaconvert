/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const Playlist = require("../src/playlist");

describe('Playlist()', () => {
  beforeAll(() => {
    global.pipeline = {outputBucket: 'outputs'};

    global.emcJob = {
      settings: {
        inputs: [{}]
      }
    };
  });

  it('should produce proper structure for HLS output group', () => {
    global.job = {
      inputs: [
        {key: 'input.mp4'}
      ],
      outputs: [
        {
          id: "1",
          key: "600k",
          presetId: "1351620000001-200040", // Preset: hls_600k.json
          rotate: "auto",
          segmentDuration: "10.0",
        },
        {
          id: "2",
          key: "400k",
          presetId: "1351620000001-200050", // Preset: hls_400k.json
          rotate: "auto",
          segmentDuration: "10.0",
        },
      ]
    };

    const formats = ['HLSv3', 'HLSv4'];

    for (const format of formats) {
      const playlist = {
        format,
        name: 'playlist',
        outputKeys: ['600k', '400k']
      };

      const res = Playlist(playlist);
      expect(res.outputGroupSettings.type).toBe('HLS_GROUP_SETTINGS');
      expect(res.outputGroupSettings.hlsGroupSettings.destination).toBe('s3://outputs/');
      expect(res.outputGroupSettings.hlsGroupSettings.minSegmentLength).toBe(0);
      expect(res.outputGroupSettings.hlsGroupSettings.segmentLength).toBe(10);
      expect(res.outputs.length).toBe(2);
    }
  });

  it('should produce proper structure for Smooth output group', () => {
    global.job = {
      inputs: [
        {key: 'input.mp4'}
      ],
      outputs: [
        {
          id: "1",
          key: "3m",
          presetId: "1351620000001-400010",
          rotate: "auto",
          segmentDuration: "10.0",
        },
        {
          id: "2",
          key: "2m",
          presetId: "1351620000001-400020",
          rotate: "auto",
          segmentDuration: "10.0",
        },
      ]
    };

    const playlist = {
      format: 'Smooth',
      name: 'playlist',
      outputKeys: ['3m', '2m']
    };

    const res = Playlist(playlist);

    expect(res.outputGroupSettings.type).toBe('MS_SMOOTH_GROUP_SETTINGS');
    expect(res.outputGroupSettings.msSmoothGroupSettings.destination).toBe('s3://outputs/');
    expect(res.outputGroupSettings.msSmoothGroupSettings.fragmentLength).toBe(2);
    expect(res.outputs.length).toBe(2);
  });

  it('should produce proper structure for MPEG-DASH output group', () => {
    global.job = {
      inputs: [
        {key: 'input.mp4'}
      ],
      outputs: [
        {
          id: "1",
          key: "video",
          presetId: "1351620000001-500050",
          rotate: "auto",
          segmentDuration: "10.0",
        },
        {
          id: "2",
          key: "audio",
          presetId: "1351620000001-500060",
          rotate: "auto",
          segmentDuration: "10.0",
        },
      ]
    };

    const playlist = {
      format: 'MPEG-DASH',
      name: 'playlist',
      outputKeys: ['video', 'audio']
    };

    const res = Playlist(playlist);

    expect(res.outputGroupSettings.type).toBe('DASH_ISO_GROUP_SETTINGS');
    expect(res.outputGroupSettings.dashIsoGroupSettings.destination).toBe('s3://outputs/');
    expect(res.outputGroupSettings.dashIsoGroupSettings.fragmentLength).toBe(2);
    expect(res.outputGroupSettings.dashIsoGroupSettings.segmentLength).toBe(10);
    expect(res.outputs.length).toBe(2);
  });

  it('should include sidecar caption outputs', () => {
    global.job = {
      inputs: [
        {
          key: 'input.mp4',
          inputCaptions: {
            captionSources: [
              {
                key: "de.srt",
                label: "de",
                language: "de"
              }
            ]
          }
        }
      ],
      outputs: [
        {
          id: "1",
          key: "video",
          presetId: "1351620000001-500050",
          rotate: "auto",
          segmentDuration: "10.0",
          captions: {
            captionFormats: [
              {
                format: 'webvtt',
                pattern: 'vtt-{language}'
              }
            ]
          }
        }
      ]
    };

    global.emcJob = {
      settings: {
        inputs: [
          {
            captionSelectors: {
              "Caption selector 1": {
                sourceSettings: {
                  fileSourceSettings: {
                    sourceFile: 'de.srt'
                  }
                }
              }
            }
          }
        ]
      }
    };

    const playlist = {
      format: 'MPEG-DASH',
      name: 'playlist',
      outputKeys: ['video']
    };

    const res = Playlist(playlist);

    expect(res.outputs.length).toBe(2);
    expect(res.outputs.find(
      output => output.captionDescriptions?.[0].destinationSettings.destinationType === 'WEBVTT')
    ).toBeDefined();
  });
});
