/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Recursively removes empty properties from an object. Empty properties are the ones with a value
 * of undefined, null or empty string. This function returns a new object and does not modify the
 * existing object.
 *
 * @param {object} obj The object from which empty props are removed.
 * @return {object} A new object without empty properties.
 */
function removeEmpty(obj) {
  if (!obj || typeof obj !== 'object')
    return obj;

  return Array.isArray(obj) ? obj.map(e => removeEmpty(e)) :
  Object.entries(obj).reduce((res, [key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(typeof value === 'number' && isNaN(value))
    ) {
      res[key] = removeEmpty(value);
    }

    return res;
  }, {});
}

module.exports = removeEmpty;
