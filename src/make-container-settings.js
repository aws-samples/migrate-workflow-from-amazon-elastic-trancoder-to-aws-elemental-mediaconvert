/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addErrorMessage } = require('./add-message');

/**
 * Maps Elastic Transcoder container to MediaConvert container.
 */
const containerMap = new Map([
  ['flac', 'RAW' ],
  ['flv',  'F4V' ],
  ['fmp4', null  ],
  ['gif',  'GIF' ],
  ['mp2',  'RAW' ],
  ['mp3',  'RAW' ],
  ['mp4',  'MP4' ],
  ['mpg',  null  ],
  ['mxf',  'MXF' ],
  ['oga',  'OGG' ],
  ['ogg',  'OGG' ],
  ['ts',   'M2TS'],
  ['wav',  'RAW' ],
  ['webm', 'WEBM'],
]);

/**
 * Maps Elastic Transcoder playlist type to MediaConvert output container type.
 */
const playlistContainerMap = new Map([
  ['HLSv3',     'M3U8'],
  ['HLSv4',     'M3U8'],
  ['MPEG-DASH', 'MPD' ],
  ['Smooth',    'ISMV'],
]);

/**
 * Makes MediaConvert container settings object from Elastic Transcoder preset object.
 *
 * @param {object} preset Elastic Transcoder preset object.
 * @param {string} playlistFormat Optional. Elastic Transcoder playlist type.
 */
function makeContainerSettings(preset, playlistFormat) {
  return typeof playlistFormat === 'string' ?
    makeContainerSettingsForAbr(playlistFormat) :
    makeContainerSettingsForFile(preset);
}

/**
 * Makes container settings for file output group.
 *
 * @param {object} preset The Elastic Transcoder preset object.
 * @returns {object} The MediaConvert container settings object.
 */
function makeContainerSettingsForFile(preset) {
  const container = containerMap.get(preset.container);

  if (container) {
    return {container};
  }

  // Handle unsupported cases
  const message = preset.container === 'fmp4' ?
    'MediaConvert only support fragmented MP4 output inside an HLS, DASH, or CMAF output group.' :
    `MediaConvert does not support ${preset.container} container.`;

    addErrorMessage([...preset._path, 'container'], message);
}

/**
 * Makes MediaConvert container output container settings for ABR output.
 *
 * @param {string} playlistFormat Elastic Transcoder playlist type.
 */
function makeContainerSettingsForAbr(playlistFormat) {
  const container = playlistContainerMap.get(playlistFormat);

  if (!container) {
    addErrorMessage(
      ['playlistFormat'],
      `Playlist format '${playlistFormat}' is invalid.`
    );
  }

  return {
    container: playlistContainerMap.get(playlistFormat)
  };
}

module.exports = {
  containerMap,
  playlistContainerMap,
  makeContainerSettings,
  makeContainerSettingsForFile,
  makeContainerSettingsForAbr
};
