/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const JobOutput = require('./job-output');
const { makeSidecarCaptionsOutputs } = require('./make-sidecar-captions-outputs');
const makeDestination = require('./make-destination');
const trimExtension = require('./trim-extension');

/**
 * Converts an Elastic Transcoder output to a MediaConvert file output group.
 *
 * @param {object} output The Elastic Transcoder output.
 * @return {object} MediaConvert output group object.
 */
function makeFileOutputGroup(output) {
  return {
    name: 'File Group',
    outputGroupSettings: {
      type: 'FILE_GROUP_SETTINGS',
      fileGroupSettings: {
        destination: makeDestination(trimExtension(output.key))
      }
    },
    outputs: [
      JobOutput(output),
      ...makeSidecarCaptionsOutputs(output)
    ]
  }
}

module.exports = makeFileOutputGroup;
