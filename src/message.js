/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

class Message {
  constructor(level, path, text) {
    this.level = level;
    this.path = path;
    this.message = text;
  }
}

module.exports = Message;
