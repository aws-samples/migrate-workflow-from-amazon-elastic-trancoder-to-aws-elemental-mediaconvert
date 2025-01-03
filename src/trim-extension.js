/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Removes file extension from file name.
 *
 * @param {string} filename The file name to remove the extension.
 */
function trimExtension(filename) {
  let i = filename.lastIndexOf('.');
  return i >= 0 ? filename.substring(0, i) : filename;
}

module.exports = trimExtension;
