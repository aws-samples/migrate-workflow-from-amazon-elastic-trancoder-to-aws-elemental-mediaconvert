/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');

/**
 * Maps Elastic Transcoder audio codec to MediaConvert audio codec.
 */
const codecMap = new Map([
  ['AAC',    'AAC'],
  ['flac',   'FLAC'],
  ['mp2',    'MP2'],
  ['mp3',    'MP3'],
  ['pcm',    'WAV'],
  ['vorbis', 'VORBIS'],
]);

/**
 * Maps Elastic Transcoder AAC channels to MediaConvert AAC coding mode.
 */
const aacChannelsMap = new Map([
  ['1', 'CODING_MODE_1_0'],
  ['2', 'CODING_MODE_2_0']
]);

/**
 * Maps Elastic Transcoder AAC profile to MediaConvert AAC profile.
 */
const aacProfileMap = new Map([
  ['AAC-LC',   'LC'],
  ['HE-AAC',   'HEV1'],
  ['HE-AACv2', 'HEV2']
]);

/**
 * Converts Elastic Transcoder a preset audio parameters object to a MediaConvert AudioDescription
 * object.
 *
 * @param {object} audioParams The Elastic Transcoder preset AudioParameters object.
 * @return {object} The MediaConvert AudioDescription object.
 */
function AudioParameters(audioParams) {

  // ETS audio settings
  let codec = audioParams.codec;
  let packingMode = audioParams.audioPackingMode;

  if (packingMode === 'OneChannelPerTrack' || packingMode === 'OneChannelPerTrackWithMosTo8Tracks')
  {
    addWarnMessage(
      [...audioParams._path, 'audioPackingMode']
      `The converter has not retained ${packingMode} audio packing mode. ` +
      'For MediaConvert audio mixing features, see ' +
      'https://docs.aws.amazon.com/mediaconvert/latest/ug/more-about-audio-tracks-selectors.html ' +
      'https://docs.aws.amazon.com/mediaconvert/latest/ug/audio-descriptions.html'
    );
  }

  // Consulted with Brian for the following:
  // bitOrder: ETS only supports little-ending. EMF always use little-endian for WAV output.
  // signed:   ETS only supports signed. EMF always produce signed WAV output.

  // Return MediaConvert AudioDescription object.
  return {
    codecSettings: {
      codec: codecMap.get(codec),

      // Codec specific settings (e.g., AacSettings) object.
      [`${codecMap.get(codec).toLocaleLowerCase()}Settings`]: {
        sampleRate: parseInt(audioParams.sampleRate),
        bitrate: parseInt(audioParams.bitRate) * 1000,
        channels: codec === 'AAC' ? null : parseInt(audioParams.channels),
        codingMode: codec === 'AAC' ? aacChannelsMap.get(audioParams.channels) : null,
        codecProfile: aacProfileMap.get(audioParams.codecOptions.profile),
        bitDepth: parseInt(audioParams.codecOptions.bitDepth)
      }
    },

    audioSourceName: 'Audio Selector 1'
  };
}

module.exports = AudioParameters;
