/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

/**
 * Recursively adds data path to an object. The path property name added is `_path`.
 *
 * This function creates a new object and does not modify the original object.
 *
 * @param {object} obj The object to add data path.
 * @param {array} path The data path to insert.
 * @return {object | array} A copy of the object with added paths.
 */
function addPath(obj, path) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((o, i) => addPath(o, [...path, i]));
  }
  else {
    return Object.keys(obj).reduce((res, key) => {
      res[key] = addPath(obj[key], [...path, key]);
      return res;
    }, {_path: path})
  }
}

module.exports = addPath;
