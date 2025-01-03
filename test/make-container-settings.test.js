/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { makeContainerSettings } = require("../src/make-container-settings");

describe('makeContainerSettings()', () => {
  it('should use ABR container when playlist is specified', () => {
    const preset = {
      container: 'ts'
    };

    const res = makeContainerSettings(preset, 'HLSv4');

    expect(res.container).toBe('M3U8');
  });

  it('should use file container in the preset when playlist is not specified', () => {
    const preset = {
      container: 'ts'
    };

    const res = makeContainerSettings(preset);

    expect(res.container).toBe('M2TS');
  });
});
