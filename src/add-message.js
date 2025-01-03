/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const Message = require('./message');

/**
 * Adds a conversion message.
 *
 * @param {string} level The message level.
 * @param {string[]} path Optional. The data path of the Elastic Transcoder resource object(job or
 * preset).
 * @param {string} text The message.
 */
function addMessage(level, path, text) {
  if (!Array.isArray(global.messages)) {
    global.messages = [];
  }
  global.messages.push(new Message(level, path, text));
}

/**
 * Adds an info conversion message.
 *
 * @param {string[]} path Optional. The data path of the Elastic Transcoder resource object(job or
 * preset).
 * @param {string} text The message.
 */
function addInfoMessage(path, text) {
  addMessage('INFO', path, text);
}

/**
 * Adds a warning conversion message.
 *
 * @param {string[]} path Optional. The data path of the Elastic Transcoder resource object(job or
 * preset).
 * @param {string} text The message.
 */
function addWarnMessage(path, text) {
  addMessage('WARN', path, text);
}

/**
 * Adds an error conversion message.
 *
 * @param {string[]} path Optional. The data path of the Elastic Transcoder resource object(job or
 * preset).
 * @param {string} text The message.
 */
function addErrorMessage(path, text) {
  addMessage('ERROR', path, text);
}

module.exports = {
  addMessage,
  addInfoMessage,
  addWarnMessage,
  addErrorMessage
};
