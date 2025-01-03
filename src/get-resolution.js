/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Gets video width and height from Elastic Transcoder video settings.
 *
 * @param {object} videoParams Elastic Transcoder video parameters object.
 * @return {number[]} An array of integers denoting [width, height]. If resolution is auto, both
 * width and height will be null.
 */
function getResolution(videoParams) {
  let res = [null, null];

  if (videoParams.maxWidth || videoParams.maxHeight) {
    res[0] = videoParams.maxWidth  === 'auto' ? null : parseInt(videoParams.maxWidth);
    res[1] = videoParams.maxHeight === 'auto' ? null : parseInt(videoParams.maxHeight);
  }
  else if (videoParams.resolution) {
    if (videoParams.resolution !== 'auto') {
      let parts = videoParams.resolution.split('x');
      res[0] = parseInt(parts[0]);
      res[1] = parseInt(parts[1]);
    }
  }

  return res;
}

module.exports = getResolution;
