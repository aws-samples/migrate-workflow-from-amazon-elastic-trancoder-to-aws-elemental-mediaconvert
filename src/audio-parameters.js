/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addErrorMessage, addWarnMessage } = require('./add-message');
const removeEmpty = require('./remove-empty');

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
 * The list of MediaConvert audio codecs that has the bitrate setting.
 */
const emcBitrateAllowed = new Set(['AAC', 'MP2', 'MP3']);

/**
 * Elastic Transcoder audio codec to sample rate.
 */
const defaultSampleRateMap = new Map([
  ['AAC',    48000],
  ['flac',   48000],
  ['mp2',    48000],
  ['mp3',    48000],
  ['pcm',    44100],
  ['vorbis', 48000],
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

  // MediaConvert audio codec
  let emcCodec = codecMap.get(codec);

  if (packingMode === 'OneChannelPerTrack' || packingMode === 'OneChannelPerTrackWithMosTo8Tracks')
  {
    addWarnMessage(
      [...audioParams._path, 'audioPackingMode'],
      `The converter has not retained ${packingMode} audio packing mode. ` +
      'For MediaConvert audio mixing features, see ' +
      'https://docs.aws.amazon.com/mediaconvert/latest/ug/more-about-audio-tracks-selectors.html ' +
      'https://docs.aws.amazon.com/mediaconvert/latest/ug/audio-descriptions.html'
    );
  }

  if (audioParams.bitRate && !emcBitrateAllowed.has(emcCodec)) {
    addWarnMessage(
      [...audioParams._path, 'bitRate'],
      `MediaConvert does not support ${codec} bitrate. This settings is ignored.`
    );
  }

  // Consulted with Brian for the following:
  // bitOrder: ETS only supports little-ending. EMF always use little-endian for WAV output.
  // signed:   ETS only supports signed. EMF always produce signed WAV output.

  // Return MediaConvert AudioDescription object.
  return removeEmpty({
    codecSettings: {
      codec: emcCodec,

      // Codec specific settings (e.g., AacSettings) object.
      [`${emcCodec.toLocaleLowerCase()}Settings`]: {
        sampleRate: convertSampleRate(audioParams),
        bitrate: emcBitrateAllowed.has(emcCodec) ? parseInt(audioParams.bitRate) * 1000 : null,
        channels: convertChannels(audioParams),
        codingMode: makeCodingMode(audioParams),
        codecProfile: aacProfileMap.get(audioParams.codecOptions?.profile),
        bitDepth: parseInt(audioParams.codecOptions?.bitDepth)
      }
    },

    audioSourceName: 'Audio Selector 1'
  });
}

/**
 * Converts Elastic Transcoder audio sample rate to MediaConvert audio sample rate.
 *
 * Note that when sample rate is auto, Elastic Transcoder gets the sample rate from the job inputs;
 * however, MediaConvert require sample rate to be explicitly set. In this case, this function
 * returns a default sample rate that's used in the MediaConvert console, when allowed.
 *
 * @param {object} audioParams The Elastic Transcoder preset AudioParameters object.
 * @return {number} The MediaConvert audio sample rate (Hz) or undefined (falsy).
 */
function convertSampleRate(audioParams) {
  if (audioParams.sampleRate === 'auto') {
    if (args['insert-defaults']) {
      let res = defaultSampleRateMap.get(audioParams.codec);
      addWarnMessage(
        [...audioParams._path, 'sampleRate'],
        `The audio sample rate for ${audioParams.codec} is set to 'auto'. ` +
        `The converter has applied a static default value of ${res}.`
      );
      return res;
    }
    else {
      addErrorMessage(
        [...audioParams._path, 'sampleRate'],
        `The audio sample rate for ${audioParams.codec} is set to 'auto'. ` +
        `Audio sample rate is required, but no default value has been applied.`
      );
      return;
    }
  }
  else {
    // Elastic Transcoder audio sampleRate settings is required; so it can't be null or undefined.
    return parseInt(audioParams.sampleRate);
  }
}

/**
 * Converts Elastic Transcoder audio channels to MediaConvert audio channels.
 *
 * @param {object} audioParams The Elastic Transcoder preset AudioParameters object.
 * @return {number} The MediaConvert channels or undefined for AAC.
 */
function convertChannels(audioParams) {
  const codec = audioParams.codec;

  // MediaConvert AAC does not have `channels` setting.
  if (codec === 'AAC') {
    return;
  }

  if (audioParams.channels === 'auto') {
    if (args['insert-defaults']) {
      addWarnMessage(
        [...audioParams._path, 'channels'],
        `The audio channels for ${audioParams.codec} is set to 'auto'. ` +
        `The converter has applied a static default value of 2.`
      );
      return 2;
    }
    else {
      addErrorMessage(
        [...audioParams._path, 'channels'],
        `The audio channels for ${audioParams.codec} is set to 'auto'. ` +
        `Audio channels is required, but no default value has been applied.`
      );
      return;
    }
  }
  else {
    // Elastic Transcoder audio channels settings is required; so it can't be null or undefined.
    return parseInt(audioParams.channels);
  }
}

/**
 * Converts Elastic Transcoder audio channels to MediaConvert coding mode.
 *
 * @param {object} audioParams The Elastic Transcoder preset AudioParameters object.
 * @return {string} The MediaConvert AAC audio coding mode or undefined.
 */
function makeCodingMode(audioParams) {
  const codec = audioParams.codec;

  // Coding mode only applies to AAC
  if (codec !== 'AAC') {
    return;
  }

  if (audioParams.channels === 'auto') {
    if (args['insert-defaults']) {
      addWarnMessage(
        [...audioParams._path, 'channels'],
        `The audio channels for ${audioParams.codec} is set to 'auto'. ` +
        `The converter has applied a static default value of CODING_MODE_2_0.`
      );
      return 'CODING_MODE_2_0';
    }
    else {
      addErrorMessage(
        [...audioParams._path, 'channels'],
        `The audio channels for ${audioParams.codec} is set to 'auto'. ` +
        `Audio channels is required, but no default value has been applied.`
      );
      return;
    }
  }
  else {
    // Elastic Transcoder audio channels settings is required; so it can't be null or undefined.
    return aacChannelsMap.get(audioParams.channels);
  }
}

module.exports = {
  AudioParameters,
  convertChannels,
  convertSampleRate,
  makeCodingMode,
};
