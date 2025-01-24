/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addErrorMessage, addInfoMessage, addWarnMessage } = require('./add-message');
const { getPar } = require('./get-par');
const removeEmpty = require('./remove-empty');

/**
 * Video codecs unsupported by MediaConvert.
 */
const unsupportedCodecs = new Set(['gif']);

/**
 * Maps Elastic Transcoder video codec to MediaConvert video codec.
 */
const codecMap = new Map([
  ['H.264', 'H_264'],
  ['mpeg2', 'MPEG2'],
  ['vp8',   'VP8'],
  ['vp9',   'VP9']
]);

/**
 * Maps Elastic Transcoder framerate to MediaConvert framerate.
 */
const framerateMap = new Map([
  ['auto',  null],
  ['10',    {framerateNumerator:10,    framerateDenominator:1}],
  ['15',    {framerateNumerator:15,    framerateDenominator:1}],
  ['23.97', {framerateNumerator:24000, framerateDenominator:1001}],
  ['24',    {framerateNumerator:24,    framerateDenominator:1}],
  ['25',    {framerateNumerator:25,    framerateDenominator:1}],
  ['29.97', {framerateNumerator:30000, framerateDenominator:1001}],
  ['30',    {framerateNumerator:30,    framerateDenominator:1}],
  ['60',    {framerateNumerator:60,    framerateDenominator:1}],
]);

/**
 * Maps Elastic Transcoder video interlace mode to MediaConvert interlace mode.
 *
 * MediaConvert default value is PROGRESSIVE.
 */
const interlaceModeMap = new Map([
  ['auto',        null],
  ['Progressive', null], // Just use the default value.
  ['TopFirst',    'TOP_FIELD'],
  ['BottomFirst', 'BOTTOM_FIELD']
]);

/**
 * Maps Elastic Transcoder MPEG-2 chroma subsampling to MediaConvert MPEG-2 codec profile.
 */
const chromaMap = new Map([
  ['yuv420p', 'MAIN'],
  ['yuv422p', 'PROFILE_422']
]);

/**
 * Gets MediaConvert video rate control mode based on Elastic Transcoder video settings.
 *
 * @param {string} videoParams The Elastic Transcoder video parameters object.
 */
function getVideoRateControlMode(videoParams) {
  const codec = videoParams.codec;
  const bitRate = videoParams.bitRate;
  const maxBitRate = videoParams.codecOptions?.maxBitRate;
  const hasBitrate = !!bitRate && bitRate !== 'auto';
  const hasMaxBitrate = !!maxBitRate;

  switch (codec) {
    case 'H.264':
      return hasBitrate && !hasMaxBitrate ? 'CBR' : 'QVBR';

    case 'mpeg2':
      return hasBitrate && !hasMaxBitrate ? 'CBR' : 'VBR';

    case 'vp8':
    case 'vp9':
      return 'VBR';
  }
}

/**
 * Makes MediaConvert generic video CodecSettings object.
 *
 * @param {object} videoParams Elastic Transcoder VideoParameters object.
 * @returns {object} The result MediaConvert CodecSettings object.
 */
function makeCodecSettings(videoParams) {
  // ETS codec
  let codec = videoParams.codec;

  // ETS codec profile
  let profile = videoParams.codecOptions.profile;

  // ETS codec level
  let level = videoParams.codecOptions.level;

  if (unsupportedCodecs.has(codec)) {
    addErrorMessage(
      [...videoParams._path, 'codec'],
      `MediaConvert does not support ${codec} video codec.`
    );
  }

  if (level === '1b') {
    addWarnMessage(
      [...videoParams._path, 'codecOptions', 'level'],
      'MediaConvert does not support H.264 codec level \'1b\'. Ignoring this setting which tells ' +
      'MediaConvert to automatically detect codec level.'
    );
  }

  if (codec === 'vp8' && profile) {
    addWarnMessage(
      [...videoParams._path, 'codecOptions', 'profile'],
      'MediaConvert does not support VP8 profile. This settings is ignore.'
    );
  }

  // The result generic MediaConvert CodecSettings object.
  let res = {
    codec: codecMap.get(codec)
  };

  // MediaConvert rate control mode.
  let rateControlMode = getVideoRateControlMode(videoParams);

  // Elastic Transcoder bit rate
  let bitRate = videoParams.bitRate;

  // Elastic Transcoder max bit rate
  let maxBitRate = videoParams.codecOptions?.maxBitRate;

  if (rateControlMode === 'VBR' && (!bitRate || bitRate === 'auto')) {
    addWarnMessage(
      [...videoParams._path, 'bitRate'],
      'When using VBR, MediaConvert requires video bitrate to be specified, but it is not ' +
      'specified in the Elastic Transcoder preset settings.'
    );
  }

  if (rateControlMode === 'QVBR' && !maxBitRate) {
    addWarnMessage(
      [...videoParams._path, 'codecOptions', 'maxBitRate'],
      'When using QVBR, MediaConvert requires video max bitrate to be specified, but it is not ' +
      'specified in the Elastic Transcoder preset settings.'
    );
  }

  // MediaConvert bitrate
  let bitrate = rateControlMode === 'QVBR' ? null : parseInt(bitRate) * 1000;

  // MediaConvert max bitrate
  let maxBitrate = rateControlMode === 'CBR' ? null : parseInt(maxBitRate) * 1000;

  // Frame rate
  let fr = framerateMap.get(videoParams.frameRate);

  // Pixel aspect ratio
  let par = getPar(videoParams);

  // ETS FixedGOP value as boolean.
  let fixedGOP = videoParams.fixedGOP === 'true';

  // The codec specific settings object, e.g., H264Settings object.
  let codecSettings = {
    gopSizeUnits: fixedGOP ? 'FRAMES' : null,
    gopSize: fixedGOP ? parseInt(videoParams.keyframesMaxDist) : null,
    bitrate,
    rateControlMode,
    framerateControl: fr ? 'SPECIFIED' : null,
    framerateNumerator: fr ? fr.framerateNumerator : null,
    framerateDenominator: fr ? fr.framerateDenominator : null,
    parControl: par ? 'SPECIFIED' : null,
    parNumerator: par ? par.parNumerator : null,
    parDenominator: par ? par.parDenominator : null,
    codecProfile: codec === 'H.264' ? profile.toUpperCase() : codec === 'mpeg2' ?
      chromaMap.get(videoParams.codecOptions.chromaSubsampling) : null,
    codecLevel:
      (codec === 'H.264' && level && level !== '1b') ? `LEVEL_${level.replace('.', '_')}` : null,
    entropyEncoding: profile === 'baseline' ? 'CAVLC' : null,
    numberReferenceFrames: parseInt(videoParams.codecOptions.maxReferenceFrames),
    numberBFramesBetweenReferenceFrames: profile === 'baseline' ? 0 : null,
    maxBitrate,
    hrdBufferSize: parseInt(videoParams.codecOptions.bufferSize),
    interlaceMode: interlaceModeMap.get(videoParams.codecOptions.interlacedMode)
  }

  switch (videoParams.codec) {
    case 'H.264':
      res.h264Settings = codecSettings;
      break;

    case 'mpeg2':
      res.mpeg2Settings = codecSettings;
      break;

    case 'vp8':
      res.vp8Settings = codecSettings;
      break;

    case 'vp9':
      res.vp9Settings = codecSettings;
      break;
  }

  return removeEmpty(res);
}

module.exports = makeCodecSettings;
