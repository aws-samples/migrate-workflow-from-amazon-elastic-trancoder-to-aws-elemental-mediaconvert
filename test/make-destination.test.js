/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const makeDestination = require("../src/make-destination");

describe('makeDestination()', () => {
  beforeAll(() => {
    global.pipeline = {

    }
  });

  it('should use proper S3 bucket', () => {
    global.pipeline = {outputBucket: 'output'};
    global.job = {outputKeyPrefix: ''};
    expect(makeDestination()).toBe('s3://output/');

    global.pipeline = {contentConfig: {bucket: 'output'}};
    expect(makeDestination()).toBe('s3://output/');

    global.pipeline = {thumbnailConfig: {bucket: 'thumbnails'}};
    expect(makeDestination(null, true)).toBe('s3://thumbnails/');
  });

  it('should use job output prefix', () => {
    global.pipeline = {outputBucket: 'output'};
    global.job = {outputKeyPrefix: 'prefix/'};
    expect(makeDestination('a')).toBe('s3://output/prefix/a');

    global.job = {outputKeyPrefix: '/prefix/'};
    expect(makeDestination('a')).toBe('s3://output/prefix/a');
  });
});
