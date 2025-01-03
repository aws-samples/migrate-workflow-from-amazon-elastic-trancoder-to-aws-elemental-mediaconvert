/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const AudioParameters = require('./audio-parameters');
const { makeContainerSettings } = require('./make-container-settings');
const Thumbnails = require('./thumbnails');
const VideoParameters = require('./video-parameters');

/**
 * Converts an Elastic Transcoder preset object to MediaConvert preset objects.
 *
 * @param {object} preset The Elastic Transcoder preset object.
 * @param {string} playlistFormat Optional. The Elastic Transcoder playlist format.
 * @returns {array} The preset object plus thumbnails preset if exists.
 */
function Preset(preset, playlistFormat) {
  const name = ('ETS ' + preset.name.replace(/[$&,:;?<>`\\"#%{}/|\\\\^~]/g, '')).substring(0, 65);

  /**
   * MediaConvert thumbnail settings.
   */
  const thumbnails = Thumbnails(preset.thumbnails);

  return [
    {
      name,
      description: preset.description,
      settings: {
        containerSettings: makeContainerSettings(preset, playlistFormat),
        audioDescriptions: preset.audio && preset.audio.channels !== '0' ?
          [AudioParameters(preset.audio)] : null,
        videoDescription: preset.video ? VideoParameters(preset.video) : null,
      }
    },
    thumbnails ? {
      name: `${name} - thumbnails`,
      description: preset.description,
      settings: thumbnails
    } : null
  ]
  .filter(output => !!output)
}

module.exports = Preset;
