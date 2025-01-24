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

  const maxWidth  = parseInt(videoParams.maxWidth);
  const maxHeight = parseInt(videoParams.maxHeight);
  const resolution = getResolution(videoParams.resolution);

  // MediaConvert color corrector object.
  let colorCorrector = makeColorCorrector(videoParams.codecOptions.colorSpaceConversionMode);

  return {
    codecSettings: makeCodecSettings(videoParams),
    width:  (!isNaN(maxWidth) || !isNaN(maxHeight)) ? maxWidth  : resolution?.width,
    height: (!isNaN(maxWidth) || !isNaN(maxHeight)) ? maxHeight : resolution?.height,
    scalingBehavior: SizingPolicy(videoParams),
    videoPreprocessors: colorCorrector ? {colorCorrector} : null
  };
}

module.exports = VideoParameters;
