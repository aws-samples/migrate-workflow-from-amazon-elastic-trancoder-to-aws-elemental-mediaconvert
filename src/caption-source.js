/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');
const { toMillis, toSeconds } = require('./time-span');

/**
 * Maps sidecar caption file extension to MediaConvert captions source type.
 */
const captionsSourceMap = new Map([
  // ['dfxp', 'TTML'], MediaConvert currently does not support DFXP.
  ['scc',  'SCC'],
  ['srt',  'SRT'],
  ['ttml', 'TTML'],
  ['vtt',  'WEBVTT'],
  // ['xml', 'TTML'], MediaConvert currently does not support EBU-TT.
]);

/**
 * Converts an Elastic Transcoder caption source object to a MediaConvert captions selector object.
 *
 * @param {object} captionSource The caption source object to convert.
 * @return {object} The MediaConvert captions selector object or undefined.
 */
function CaptionSource(captionSource) {
  if (!captionSource || typeof captionSource?.key !== 'string') {
    return;
  }

  // Filename extension, e.g., 'srt'
  const index = captionSource.key.lastIndexOf('.');
  const extension = index > -1 ? captionSource.key.substring(index + 1).toLowerCase().trim() : null;

  // MediaConvert captions source type
  const sourceType = captionsSourceMap.get(extension);

  if (!sourceType) {
    addWarnMessage(
      [...captionSource._path, 'key'],
      `The captions source type '${extension}' is not supported by MediaConvert. This captions source is ignored.`
    );
    return;
  }

  // Time offset to MediaConvert time delta
  const timeOffset = captionSource.timeOffset;
  const timeDelta = timeOffset ?
    (timeOffset.includes('.') ? toMillis(timeOffset) : toSeconds(timeOffset)) : null;
  const timeDeltaUnits = timeOffset ?
    (timeOffset.includes('.') ? 'MILLISECONDS' : 'SECONDS') : null;

  if (isNaN(timeDelta)) {
    addWarnMessage(
      [...captionSource._path, 'key'],
      `Timeoffset cannot be parsed`
    );
  }

  // The MediaConvert captions selector object.
  return {
    sourceSettings: {
      sourceType,
      fileSourceSettings: {
        sourceFile: `s3://${pipeline.inputBucket}/${captionSource.key}`,
        timeDelta,
        timeDeltaUnits,
      }
    }
  };
}

module.exports = {
  captionsSourceMap,
  CaptionSource
};
