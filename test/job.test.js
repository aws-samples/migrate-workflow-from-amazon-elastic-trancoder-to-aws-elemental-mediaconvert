/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { JSONCasing } = require('json-casing');
const addPath = require("../src/add-path");
const Job = require("../src/job");

describe('Job()', () => {
  beforeEach(() => {
    global.args = {
      'role-arn': 'arn:aws:iam::123456789012:role/role'
    }

    global.pipeline = {
      inputBucket: 'inputs',
      contentConfig: {
        bucket: 'content'
      }
    };

    global.messages = [];
  });

  it('should include role', () => {
    const job = {
      inputs: [{}],
      outputs: []
    };
    const res = JSONCasing.toCamel(Job(job));
    expect(res.role).toBe(global.args['role-arn']);
  });

  it('should not include role if resource type is template', () => {
    global.args = {name: 'HLS template'};
    const job = {
      inputs: [{}],
      outputs: []
    };
    const res = JSONCasing.toCamel(Job(job));
    expect(res.role).toBeUndefined();
  });

  it('should create file output group for non-playlist outputs', () => {
    const job = {
      inputs: [{}],
      outputs: [
        {id: '1', presetId: '1351620000001-000010', key: 'a.mp4'},
        {id: '2', presetId: '1351620000001-000001', key: 'b.mp4'}
      ]
    };

    global.job = addPath(job, []);

    const res = JSONCasing.toCamel(Job(global.job));

    expect(res.settings.outputGroups[0].outputGroupSettings.type).toBe('FILE_GROUP_SETTINGS');
    expect(res.settings.outputGroups[1].outputGroupSettings.type).toBe('FILE_GROUP_SETTINGS');
  });

  it('should create HLS output group for HLSv4', () => {
    const job = {
      inputs: [{}],
      outputs: [
        {id: '1', presetId: '1351620000001-200050', key: 'a.mp4'},
        {id: '2', presetId: '1351620000001-200040', key: 'b.mp4'}
      ],
      playlists: [
        {
          format: "HLSv4",
          name: "abc",
          outputKeys: [
            "a.mp4",
            "b.mp4"
          ]
        }
      ],
    };

    global.job = addPath(job, []);

    const res = JSONCasing.toCamel(Job(global.job));

    expect(res.settings.outputGroups.length).toBe(1);
    expect(res.settings.outputGroups[0].outputGroupSettings.type).toBe('HLS_GROUP_SETTINGS');
    expect(res.settings.outputGroups[0].outputGroupSettings.hlsGroupSettings.destination).toBe('s3://content/');
    expect(res.settings.outputGroups[0].outputGroupSettings.hlsGroupSettings.minSegmentLength).toBe(0);
    expect(res.settings.outputGroups[0].outputs.length).toBe(2);
    expect(res.settings.outputGroups[0].outputs[0].nameModifier).toBeDefined();
    expect(res.settings.outputGroups[0].outputs[0].containerSettings.container).toBe('M3U8');
    expect(res.settings.outputGroups[0].outputs[1].nameModifier).toBeDefined();
    expect(res.settings.outputGroups[0].outputs[1].containerSettings.container).toBe('M3U8');
  });

  it('should create Smooth output group for Smooth', () => {
    const job = {
      inputs: [{}],
      outputs: [
        {id: '1', presetId: '1351620000001-400010', key: 'a.mp4'},
        {id: '2', presetId: '1351620000001-400020', key: 'b.mp4'}
      ],
      playlists: [
        {
          format: "Smooth",
          name: "abc",
          outputKeys: [
            "a.mp4",
            "b.mp4"
          ]
        }
      ],
    };

    global.job = addPath(job, []);

    const res = JSONCasing.toCamel(Job(global.job));

    expect(res.settings.outputGroups[0].outputGroupSettings.type).toBe('MS_SMOOTH_GROUP_SETTINGS');
    expect(res.settings.outputGroups[0].outputGroupSettings.msSmoothGroupSettings.destination).toBe('s3://content/');
    expect(res.settings.outputGroups[0].outputGroupSettings.msSmoothGroupSettings.fragmentLength).toBe(2);
    expect(res.settings.outputGroups.length).toBe(1);
    expect(res.settings.outputGroups[0].outputs.length).toBe(2);
    expect(res.settings.outputGroups[0].outputs[0].containerSettings.container).toBe('ISMV');
    expect(res.settings.outputGroups[0].outputs[1].containerSettings.container).toBe('ISMV');
  });

  it('should create DASH output group for MPEG-DASH', () => {
    const job = {
      inputs: [{}],
      outputs: [
        {id: '1', presetId: '1351620000001-500050', key: 'a.mp4'},
        {id: '2', presetId: '1351620000001-500060', key: 'b.mp4'}
      ],
      playlists: [
        {
          format: "MPEG-DASH",
          name: "abc",
          outputKeys: [
            "a.mp4",
            "b.mp4"
          ]
        }
      ],
    };

    global.job = addPath(job, []);

    const res = JSONCasing.toCamel(Job(global.job));

    expect(res.settings.outputGroups[0].outputGroupSettings.type).toBe('DASH_ISO_GROUP_SETTINGS');
    expect(res.settings.outputGroups[0].outputGroupSettings.dashIsoGroupSettings.destination).toBe('s3://content/');
    expect(res.settings.outputGroups[0].outputGroupSettings.dashIsoGroupSettings.fragmentLength).toBe(2);
    expect(res.settings.outputGroups.length).toBe(1);
    expect(res.settings.outputGroups[0].outputs.length).toBe(2);
    expect(res.settings.outputGroups[0].outputs[0].containerSettings.container).toBe('MPD');
    expect(res.settings.outputGroups[0].outputs[1].containerSettings.container).toBe('MPD');
  });

  it('should include user metadata', () => {
    const job = {
      inputs: [{}],
      outputs: [],
      userMetadata: {
        camelCase:  'camelCase',
        snake_case: 'snake_case',
        PascalCase: 'PascalCase'
      }
    };

    const res = Job(job);

    expect(Object.keys(res.UserMetadata).length).toBe(3);
    expect(res.UserMetadata).toEqual(job.userMetadata);
  });

  it('should not include user metadata for template', () => {
    global.args['name'] = 'abc';

    const job = {
      inputs: [{}],
      outputs: [],
      userMetadata: {k: 'v'}
    };

    const res = Job(job);

    expect(res.UserMetadata).toBeUndefined();
  });

  it('should use correct case for property names', () => {
    global.args['camel'] = true;

    const job = {
      inputs: [{}],
      outputs: [],
      userMetadata: {k: 'v'}
    };

    let res = Job(job);
    expect(res.Settings).toBeUndefined();
    expect(res.settings.inputs).toBeDefined();
    expect(res.UserMetadata).toBeUndefined();
    expect(res.userMetadata).toBe(job.userMetadata);

    global.args['camel'] = false;

    res = Job(job);
    expect(res.settings).toBeUndefined();
    expect(res.Settings.Inputs).toBeDefined();
    expect(res.userMetadata).toBeUndefined();
    expect(res.UserMetadata).toBe(job.userMetadata);
  });
});
