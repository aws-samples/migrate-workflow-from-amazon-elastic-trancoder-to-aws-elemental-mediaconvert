/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');

/**
 * Maps Elastic Transcoder sizing policy and padding policy to MediaConvert scaling behavior.
 *
 * The keys have the format `<sizingPolicy>_<paddingPolicy>`.
 *
 * The value of `null` means default MediaConvert scaling behavior, which is fit with pad.
 */
const sizingPolicyMap = new Map([
  ['Fit_NoPad',           'FIT'],
  ['Fit_Pad'   ,          null], // MediaConvert default behavior is fit with padding.
  ['Fill_NoPad',          'FILL'],
  ['Fill_Pad',            'FILL'],
  ['Stretch_NoPad',       'STRETCH_TO_OUTPUT'],
  ['Stretch_Pad',         'STRETCH_TO_OUTPUT'],
  ['Keep_NoPad',          null], // MediaConvert doesn't have Keep equivalent
  ['Keep_Pad',            null],
  ['ShrinkToFit_NoPad',  'FIT_NO_UPSCALE'],
  ['ShrinkToFit_Pad',    'FIT_NO_UPSCALE'], // MediaConvert does not add padding
  ['ShrinkToFill_NoPad', 'FILL'], // MediaConvert doesn't have Shrink To Fill equivalent
  ['ShrinkToFill_Pad',   'FILL']
]);

/**
 * Documentation URL.
 */
const docUrl = 'https://docs.aws.amazon.com/mediaconvert/latest/ug/video-scaling.html';

/**
 * Converts Elastic Transcoder sizing policy to MediaConvert scaling behavior.
 *
 * @param {object} model The Elastic Transcoder settings object that contains the sizing policy and
 * padding policy.
 */
function SizingPolicy(model) {
  let sizingPolicy = model.sizingPolicy;
  let paddingPolicy = model.paddingPolicy;

  if (sizingPolicy === 'Keep') {
    addWarnMessage(
      [...model._path, 'sizingPolicy'],
      'MediaConvert does not have equivalent "Keep" sizing policy. ' +
      'The default sizing policy will be used, which is fit with padding. ' +
      `For more info see ${docUrl}`
    );
  }

  if (sizingPolicy === 'ShrinkToFill') {
    addWarnMessage(
      [...model._path, 'sizingPolicy'],
      'MediaConvert does not have equivalent "ShrinkToFill" sizing policy. ' +
      'The sizing policy "Fill" is used. ' +
      `For more info see ${docUrl}`
    );
  }

  if (sizingPolicy === 'ShrinkToFit' && paddingPolicy === 'Pad') {
    addWarnMessage(
      [...model._path, 'sizingPolicy'],
      'MediaConvert does not add padding when you choose Fit without upscaling. ' +
      `For more info see ${docUrl}`
    );
  }

  return sizingPolicyMap.get(`${sizingPolicy}_${paddingPolicy}`);
}

module.exports = SizingPolicy;
