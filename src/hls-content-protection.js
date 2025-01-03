/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Converts ETS HLS Content Protection settings to MediaConvert output group encryption settings.
 *
 * @param {object} model The ETS HlsContentProtection object.
 * @returns {object} The encryption settings.
 */
function HlsContentProtection(model) {
  return {
    type: 'STATIC_KEY',
    encryptionMethod: 'AES128',
    constantInitializationVector: model.initializationVector,
    staticKeyProvider: {
      staticKeyValue: model.key,
      url: model.licenseAcquisitionUrl
    }
  }
}

module.exports = HlsContentProtection;
