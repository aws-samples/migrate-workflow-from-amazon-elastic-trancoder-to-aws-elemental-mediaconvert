/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addInfoMessage } = require('./add-message');
const makeDestination = require('./make-destination');
const Thumbnails = require('./thumbnails');
const trimExtension = require('./trim-extension');

/**
 * Converts an Elastic Transcoder output with thumbnails to a MediaConvert output group.
 *
 * @param {object} output An Elastic Transcoder output that has thumbnail settings.
 * @return {object} A MediaConvert output group object.
 */
function makeThumbnails(output) {
  let preset = global.presets[output.presetId];
  let thumbnails = preset.thumbnails;

  if (!thumbnails || !output || !output.thumbnailPattern ||
      typeof output.thumbnailPattern !== 'string')
  {
    return;
  }

  addInfoMessage(
    [...output._path, 'thumbnailPattern'],
    "Thumbnail file name pattern might have changed."
  );

  return {
    name: 'File Group',
    outputGroupSettings: {
      type: 'FILE_GROUP_SETTINGS',
      fileGroupSettings: {
        destination: makeDestination(trimExtension(output.key), true)
      }
    },
    outputs: [{
      nameModifier: output.thumbnailPattern.includes('{resolution}') ?
        `-${thumbnails.maxWidth}x${thumbnails.maxHeight}` : null,
      ...Thumbnails(thumbnails)
    }]
  }
}

module.exports = makeThumbnails;
