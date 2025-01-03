/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const AudioParameters = require('./audio-parameters');
const { makeContainerSettings } = require('./make-container-settings');
const VideoParameters = require('./video-parameters');

/**
 * Converts an Elastic Transcoder job output object to a MediaConvert output object.
 *
 * @param {object} output The Elastic Transcoder job output object.
 * @param {string} playlistFormat Optional. The Elastic Transcoder playlist format.
 * @returns {object} The result object.
 */
function JobOutput(output, playlistFormat) {
  let preset = global.presets[output.presetId];

  return {
    nameModifier: playlistFormat?.startsWith('HLS') ? `-${output.key}` : null,
    containerSettings: makeContainerSettings(preset, playlistFormat),
    audioDescriptions: preset.audio && preset.audio.channels !== '0' ?
      [AudioParameters(preset.audio)] : null,
    videoDescription: preset.video ? VideoParameters(preset.video) : null,
  }
}

module.exports = JobOutput;
