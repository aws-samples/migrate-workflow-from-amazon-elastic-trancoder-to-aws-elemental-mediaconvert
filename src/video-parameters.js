/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const makeCodecSettings = require('./make-codec-settings');
const makeColorCorrector = require('./make-color-corrector');
const getResolution = require('./get-resolution');
const SizingPolicy = require('./sizing-policy');

/**
 * Converts Elastic Transcoder preset video parameters to MediaConvert VideoDescription object.
 *
 * @param {object} videoParams The Elastic Transcoder preset video parameters object.
 */
function VideoParameters(videoParams) {
  if (!videoParams) {
    return null;
  }

  const resolution = getResolution(videoParams);

  // MediaConvert color corrector object.
  let colorCorrector = makeColorCorrector(videoParams.codecOptions.colorSpaceConversionMode);

  return {
    codecSettings: makeCodecSettings(videoParams),
    width: resolution[0],
    height: resolution[1],
    scalingBehavior: SizingPolicy(videoParams),
    videoPreprocessors: colorCorrector ? {colorCorrector} : null
  };
}

module.exports = VideoParameters;
