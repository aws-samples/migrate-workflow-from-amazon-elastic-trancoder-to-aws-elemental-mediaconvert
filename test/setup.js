/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const fs = require('fs');
const { JSONCasing } = require('json-casing');
const addPath = require('../src/add-path');

/**
 * Global jest setup function set in `jest.config.js.
 *
 * This function is run before all test files are run.
 */
async function setup() {
  await loadPresets();
}

/**
 * Loads preset fixture from disk to `global.presets`.
 */
async function loadPresets() {
  const dir = `${__dirname}/fixtures/presets`
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'));

  global.presets = {};

  for (const file of files) {
    const content = fs.readFileSync(`${dir}/${file}`, 'utf-8');
    let preset = JSONCasing.toCamel(JSON.parse(content));
    preset = addPath(preset, ['preset', preset.name]);
    global.presets[preset.id] = preset;
  }
}

module.exports = setup;
