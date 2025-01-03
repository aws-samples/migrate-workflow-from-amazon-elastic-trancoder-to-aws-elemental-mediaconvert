/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Maps Elastic Transcoder color space conversion mode to MediaConvert color space conversion.
 */
const colorMap = new Map([
  ['Bt601ToBt709', 'FORCE_709'],
  ['Bt709ToBt601', 'FORCE_601']
]);

/**
 * Makes a MediaConvert Color Corrector preprocess from Elastic Transcoder color space conversion
 * mode.
 *
 * @param {string} colorSpaceConversionMode Elastic Transcoder color space conversion mode.
 * @return {object} The color corrector object.
 */
function makeColorCorrector(colorSpaceConversionMode) {
  let c = colorMap.get(colorSpaceConversionMode);
  return c ? {colorSpaceConversion: c} : null;
}

module.exports = makeColorCorrector;
