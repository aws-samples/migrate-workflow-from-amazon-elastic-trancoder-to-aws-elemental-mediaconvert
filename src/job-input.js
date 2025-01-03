/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const Encryption = require('./encryption');
const InputCaptions = require('./input-captions');
const { TimeSpan } = require('./time-span');

/**
 * Converts an Elastic Transcoder job input object to a MediaConvert input object.
 *
 * @param {object} job The Elastic Transcoder job object.
 * @param {object} input The Elastic Transcoder input object.
 * @returns The MediaConvert job object.
 */
function JobInput(job, input) {
  // TODO: emit messages

  // Determines if any of the outputs have audio.
  let hasOutputAudio = job.outputs
    ?.map(output => global.presets[output.presetId])
    .reduce((prev, curr) => prev || !!curr.audio, false);

  return {
    fileInput: global.args['name'] ? null : `s3://${global.pipeline.inputBucket}/${input.key}`,
    audioSelectors: hasOutputAudio ? {'Audio Selector 1': {defaultSelection: "DEFAULT"}} : null,
    captionSelectors: InputCaptions(input.inputCaptions, job.outputs),
    decryptionSettings: input.encryption ? Encryption(input.encryption) : null,
    inputClippings: TimeSpan(input.timeSpan),
  };
}

module.exports = JobInput;
