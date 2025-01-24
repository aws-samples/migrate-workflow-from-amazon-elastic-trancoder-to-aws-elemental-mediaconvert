/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Gets video width and height from Elastic Transcoder video settings.
 *
 * @param {string} resolution Elastic Transcoder video resolution setting.
 * @return {object} An object with two properties: width and height. If resolutions is auto or not
 * defined, undefined is returned.
 */
function getResolution(resolution) {
  if (typeof resolution !== 'string' || resolution === 'auto' || !resolution.match(/^\d+x\d+$/)) {
    return;
  }

  const parts = resolution.split('x');

  return {
    width:  parseInt(parts[0]),
    height: parseInt(parts[1])
  }
}

module.exports = getResolution;
