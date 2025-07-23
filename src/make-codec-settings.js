/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');
const { getPar } = require('./get-par');
const removeEmpty = require('./remove-empty');

/**
 * Maps Elastic Transcoder video codec to MediaConvert video codec.
 */
const codecMap = new Map([
  ['gif',   'GIF'],
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
 * MediaConvert H.264 maximum HRD Buffer Size profile and level.
 */
const h264MaxHrdBufferSizeMap = new Map([
  ['HIGH', new Map([
    ['LEVEL_1',   262500],
    ['LEVEL_1_1', 750000],
    ['LEVEL_1_2', 1500000],
    ['LEVEL_1_3', 3000000],
    ['LEVEL_2',   3000000],
    ['LEVEL_2_1', 6000000],
    ['LEVEL_2_2', 6000000],
    ['LEVEL_3',   15000000],
    ['LEVEL_3_1', 21000000],
    ['LEVEL_3_2', 30000000],
    ['LEVEL_4',   37500000],
    ['LEVEL_4_1', 93750000],
  ])],
  ['HIGH_10BIT', new Map([
    ['LEVEL_1',   630000],
    ['LEVEL_1_1', 1800000],
    ['LEVEL_1_2', 3600000],
    ['LEVEL_1_3', 7200000],
    ['LEVEL_2',   7200000],
    ['LEVEL_2_1', 14400000],
    ['LEVEL_2_2', 14400000],
    ['LEVEL_3',   36000000],
    ['LEVEL_3_1', 50400000],
    ['LEVEL_3_2', 72000000],
    ['LEVEL_4',   90000000],
    ['LEVEL_4_1', 225000000],
  ])],
  ['HIGH_422', new Map([
    ['LEVEL_1',   840000],
    ['LEVEL_1_1', 2400000],
    ['LEVEL_1_2', 4800000],
    ['LEVEL_1_3', 9600000],
    ['LEVEL_2',   9600000],
    ['LEVEL_2_1', 19200000],
    ['LEVEL_2_2', 19200000],
    ['LEVEL_3',   48000000],
    ['LEVEL_3_1', 67200000],
    ['LEVEL_3_2', 96000000],
    ['LEVEL_4',   120000000],
    ['LEVEL_4_1', 300000000],
  ])],
  ['HIGH_422_10BIT', new Map([
    ['LEVEL_1',   840000],
    ['LEVEL_1_1', 2400000],
    ['LEVEL_1_2', 4800000],
    ['LEVEL_1_3', 9600000],
    ['LEVEL_2',   9600000],
    ['LEVEL_2_1', 19200000],
    ['LEVEL_2_2', 19200000],
    ['LEVEL_3',   48000000],
    ['LEVEL_3_1', 67200000],
    ['LEVEL_3_2', 96000000],
    ['LEVEL_4',   120000000],
    ['LEVEL_4_1', 300000000],
  ])],
  ['MAIN', new Map([
    ['LEVEL_1',   210000],
    ['LEVEL_1_1', 600000],
    ['LEVEL_1_2', 1200000],
    ['LEVEL_1_3', 2400000],
    ['LEVEL_2',   2400000],
    ['LEVEL_2_1', 4800000],
    ['LEVEL_2_2', 4800000],
    ['LEVEL_3',   12000000],
    ['LEVEL_3_1', 16800000],
    ['LEVEL_3_2', 24000000],
    ['LEVEL_4',   30000000],
    ['LEVEL_4_1', 75000000],
  ])],
  ['BASELINE', new Map([
    ['LEVEL_1',   210000],
    ['LEVEL_1_1', 600000],
    ['LEVEL_1_2', 1200000],
    ['LEVEL_1_3', 2400000],
    ['LEVEL_2',   2400000],
    ['LEVEL_2_1', 4800000],
    ['LEVEL_2_2', 4800000],
    ['LEVEL_3',   12000000],
    ['LEVEL_3_1', 16800000],
    ['LEVEL_3_2', 24000000],
    ['LEVEL_4',   30000000],
    ['LEVEL_4_1', 75000000],
  ])]
]);

const mpeg2MaxHrdBufferSizeMap = new Map([
  ['MAIN',        9781248],
  ['PROFILE_422', 47185920]
]);

const vp8MaxHrdBufferSize = 47185920;

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
 * Gets MediaConvert codec profile from Elastic Transcoder video params.
 *
 * @param {object} videoParams The Elastic Transcoder video params object.
 * @return {string} The MediaConvert codec profile or null.
 */
function getCodecProfile(videoParams) {
  const codec = videoParams.codec;
  const profile = videoParams.codecOptions?.profile;
  return codec === 'H.264' ? profile.toUpperCase() : codec === 'mpeg2' ?
    chromaMap.get(videoParams.codecOptions?.chromaSubsampling) : null;
}

/**
 * Gets MediaConvert codec level from Elastic Transcoder video params.
 *
 * @param {object} videoParams The Elastic Transcoder video params object.
 * @return {string} The MediaConvert codec level or null.
 */
function getCodecLevel(videoParams) {
  const codec = videoParams.codec;
  const level = videoParams.codecOptions?.level;
  return (codec === 'H.264' && level && level !== '1b') ? `LEVEL_${level.replace('.', '_')}` : null;
}

/**
 * Gets MediaConvert HRD Buffer Size from Elastic Transcoder video params.
 *
 * @param {object} videoParams The Elastic Transcoder video params object.
 * @return {number} The HRD Buffer Size or undefined.
 */
function getHrdBufferSize(videoParams) {
  // Elastic Transcoder bufferSize
  const bufferSize = parseInt(videoParams.codecOptions?.bufferSize) * 1000;
  const maxBitrate = parseInt(videoParams.codecOptions?.maxBitRate) * 1000;

  // MediaConvert video codec, profile, level
  const codec = codecMap.get(videoParams.codec);
  const profile = getCodecProfile(videoParams);
  const level = getCodecLevel(videoParams);

  // MediaConvert max hrdBufferSize
  const maxHrdBufferSize = {
    'H_264': (p, l) => h264MaxHrdBufferSizeMap.get(p).get(l),
    'VP8':   () => vp8MaxHrdBufferSize,
    'VP9':   () => vp8MaxHrdBufferSize,
    'MPEG2': (p) => mpeg2MaxHrdBufferSizeMap.get(p),
    'GIF':   () => undefined
  }[codec](profile, level);

  if (bufferSize) {
    if (maxHrdBufferSize && (bufferSize > maxHrdBufferSize)) {
      addWarnMessage(
        [...videoParams._path, 'bufferSize'],
        `${videoParams.codec} video buffer size is larger than MediaConvert maximum hrdBufferSize. ` +
        'Using the maximum value.'
      );

      return maxHrdBufferSize;
    }

    return bufferSize;
  }

  if (maxBitrate) {
    const hrdBufferSize = maxBitrate * 10;
    return maxHrdBufferSize ? Math.min(maxHrdBufferSize, hrdBufferSize) : hrdBufferSize;
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
  let profile = videoParams.codecOptions?.profile;

  // ETS codec level
  let level = videoParams.codecOptions?.level;

  // Elastic Transcoder bit rate
  let bitRate = videoParams.bitRate;

  // Elastic Transcoder max bit rate
  let maxBitRate = videoParams.codecOptions?.maxBitRate;

  if (videoParams.maxFrameRate) {
    addWarnMessage(
      [...videoParams._path, 'maxFrameRate'],
      'MediaConvert does not support video max frame rate. This setting is ignored.'
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

  if (codec === 'gif' && bitRate && bitRate !== 'auto') {
    addWarnMessage(
      [...videoParams._path, 'bitRate'],
      'MediaConvert does not support GIF bitrate. Video bitrate is ignored.'
    );
  }

  if (codec === 'gif' && videoParams.codecOptions?.loopCount) {
    addWarnMessage(
      [...videoParams._path, 'codecOptions', 'loopCount'],
      'MediaConvert does not support GIF loop count. This setting is ignored.'
    );
  }

  // The result generic MediaConvert CodecSettings object.
  let res = {
    codec: codecMap.get(codec)
  };

  // MediaConvert rate control mode.
  let rateControlMode = getVideoRateControlMode(videoParams);

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
  let bitrate = (codec === 'gif' || rateControlMode === 'QVBR') ? null : parseInt(bitRate) * 1000;

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
    codecProfile: getCodecProfile(videoParams),
    codecLevel: getCodecLevel(videoParams),
    entropyEncoding: profile === 'baseline' ? 'CAVLC' : null,
    numberReferenceFrames: parseInt(videoParams.codecOptions?.maxReferenceFrames),
    numberBFramesBetweenReferenceFrames: profile === 'baseline' ? 0 : null,
    maxBitrate,
    hrdBufferSize: getHrdBufferSize(videoParams),
    interlaceMode: interlaceModeMap.get(videoParams.codecOptions?.interlacedMode)
  }

  switch (videoParams.codec) {
    case 'gif':
      res.gifSettings = codecSettings;
      break;

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

module.exports = {
  getHrdBufferSize,
  makeCodecSettings
};
