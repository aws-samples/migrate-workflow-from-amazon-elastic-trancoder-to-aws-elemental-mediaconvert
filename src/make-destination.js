/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Constructs output group destination string.
 *
 * @param {string} key The output S3 key. This is optional.
 * @param {boolean} isThumbnails Optional. Determines if the destination is for thumbnails. Default
 * is false.
 * @returns {string} The S3 destination string.
 */
function makeDestination(key, isThumbnails = false) {
  let pipeline = global.pipeline;
  let outputBucket = isThumbnails ? pipeline.thumbnailConfig.bucket : pipeline.outputBucket ??
    pipeline.contentConfig.bucket;
  let outputKeyPrefix = global.job.outputKeyPrefix ?? '';

  // Remove prefix leading '/'
  outputKeyPrefix = outputKeyPrefix.startsWith('/') ?
    outputKeyPrefix.substring(1) :
    outputKeyPrefix;

  return `s3://${outputBucket}/${outputKeyPrefix}${key ?? ''}`;
}

module.exports = makeDestination;
