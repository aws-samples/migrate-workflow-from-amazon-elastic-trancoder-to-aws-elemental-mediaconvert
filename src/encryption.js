/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addInfoMessage, addWarnMessage } = require('./add-message');

/**
 * Converts Elastic Transcoder input encryption settings to MediaConvert input decryption settings.
 *
 * @param {object} encryption The Elastic Transcoder encryption settings model object.
 * @returns {object} The result object.
 */
function Encryption(encryption) {
  let mode;

  switch (encryption.mode) {
    case 'aes-cbc-pkcs7':
      mode = 'AES_CBC';
      break;

    case 'aes-ctr':
      mode = 'AES_CTR'
      break;

    case 'aes-gcm':
      mode = 'AES_GCM';
      break;

    default:
      addWarnMessage(
        [...encryption._path, 'mode'],
        `MediaConvert does not support input encryption mode ${encryption.mode}`
      );
      mode = encryption.mode;
  }

  addInfoMessage(
    encryption._path,
    'If the region of your input decryption KMS key is different from the ' +
    'region you use MediaConvert, the region must be specified in input decryption settings.'
  );

  return {
    decryptionMode: mode,
    encryptedDecryptionKey: encryption.key,
    initializationVector: encryption.initializationVector
  };
}

module.exports = Encryption;
