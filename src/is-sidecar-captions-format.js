/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Determines if an Elastic Transcoder output captions format is a sidecar format.
 *
 * @param {string} format The caption format type.
 */
function isSidecarCaptionsFormat(format) {
  return ['dfxp', 'scc', 'srt', 'webvtt'].includes(format);
}

module.exports = isSidecarCaptionsFormat;
