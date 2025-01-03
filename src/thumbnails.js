/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');
const SizingPolicy = require('./sizing-policy');

/**
 * Converts an Elastic Transcoder thumbnails object to a MediaConvert output object.
 *
 * @param {object} output An Elastic Transcoder output that has thumbnail settings.
 * @return {object} A MediaConvert output object or undefined.
 */
function Thumbnails(thumbnails) {
  if (!thumbnails) {
    return;
  }

  if (thumbnails.format === 'png') {
    addWarnMessage(
      [...thumbnails._path, 'format'],
      "MediaConvert does not support PNG thumbnails."
    );
  }

  return {
    containerSettings: {
      container: 'RAW'
    },
    videoDescription: {
      codecSettings: {
        codec: 'FRAME_CAPTURE',
        frameCaptureSettings: {
          framerateNumerator: 1,
          framerateDenominator: parseInt(thumbnails.interval)
        }
      },
      width: parseInt(thumbnails.maxWidth),
      height: parseInt(thumbnails.maxHeight),
      scalingBehavior: SizingPolicy(thumbnails)
    }
  }
}

module.exports = Thumbnails;
