/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');
const { CaptionSource } = require('./caption-source');

/**
 * Converts Elastic Transcoder input captions to MediaConvert captions selectors.
 *
 * @param {object} inputCaptions Elastic Transcoder input captions object.
 * @param {array} outputs Elastic Transcoder outputs.
 * @return {object} An object representing MediaConvert captions selectors or undefined if there are
 * no captions selectors.
 */
function InputCaptions(inputCaptions, outputs) {
  if (!inputCaptions || !hasOutputCaptions(outputs)) {
    return null;
  }

  // MediaConvert captions selectors
  let res = [];

  switch (inputCaptions.mergePolicy) {
    case 'MergeRetain':
    case 'MergeOverride':
      addWarnMessage(
        [...inputCaptions._path, 'mergePolicy'],
        'MediaConvert does not support captions merge policy.'
      );

      res = [
        makeEmbeddedCaptionsSelector(),
        ...makeFileCaptionsSelectors(inputCaptions.captionSources)
      ];
      break;

    case 'Override':
      res = makeFileCaptionsSelectors(inputCaptions.captionSources);
      break;
  }

  return res.length > 0 ? res.reduce((acc, item, index) => {
    acc[`Captions Selector ${index + 1}`] = item;
    return acc;
  }, {}) : null;
}

/**
 * Determines if any of the Elastic Transcoder outputs has captions settings.
 *
 * @param {array} outputs Elastic Transcoder output objects.
 * @return {boolean} True if any of the outputs have captions settings; false otherwise.
 */
function hasOutputCaptions(outputs) {
  if (!Array.isArray(outputs)) {
    return false;
  }

  return outputs.reduce((acc, output) => {
    const captions = output.captions;
    const formats = captions?.captionFormats;
    return acc || (captions && Array.isArray(formats) && formats.length > 0);
  }, false);
}

/**
 * Creates MediaConvert sidecar captions selectors.
 *
 * @param {array} captionSources Elastic Transcoder caption source objects.
 * @return {array} MediaConvert captions selector objects.
 */
function makeFileCaptionsSelectors(captionSources) {
  if (!Array.isArray(captionSources)) {
    return [];
  }

  return captionSources
    .map(source => CaptionSource(source))
    .filter(selector => !!selector);
}

/**
 * Creates a MediaConvert embedded captions selector.
 *
 * @returns {object} The captions selector.
 */
function makeEmbeddedCaptionsSelector() {
  return {
    sourceSettings: {
      sourceType: 'EMBEDDED',
      embeddedSourceSettings: {
        convert608To708: 'UPCONVERT'
      }
    }
  };
}

module.exports = InputCaptions;
