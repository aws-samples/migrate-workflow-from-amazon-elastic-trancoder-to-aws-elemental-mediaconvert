/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const { JSONCasing } = require('json-casing');
const { getPreset} = require('./src/load-job');
const removeEmpty = require('./src/remove-empty');
const Preset = require('./src/preset');

/**
 * Command line arguments.
 */
const argDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Shows this help message and exit.'
  },
  {
    name: 'preset-id',
    alias: 'i',
    description: 'The id of the Elastic Transcoder preset for which to convert the settings.',
  },
  {
    name: 'playlist-format',
    alias: 'f',
    description: 'Optional. A Elastic Transcoder playlist format: HLSv3, HLSv4, Smooth, or MPEG-DASH. ' +
      'If unspecified, the converter uses preset container type as the MediaConvert output container.',
  },
  {
    name: 'region',
    alias: 'r',
    description: 'The AWS region in which the Elastic Transcoder job was run, e.g., us-east-1',
  },
  {
    name: 'camel',
    alias: 'm',
    type: Boolean,
    description: 'Optional. Use camelCase for JSON property names. PascalCase is the default.'
  },
  {
    name: 'verbose',
    alias: 'v',
    type: Boolean,
    description: 'Output verbose debug messages to stderr.'
  }
];

/**
 * Command line usage info.
 */
const usage = [
  {
    content:
      'Converts Amazon Elastic Transcoder preset settings to AWS Elemental MediaConvert preset ' +
      'settings. \n\n' +

      'For the conversion, this script calls Elastic Transcoder API to get the settings of the ' +
      'preset.'
  },
  {
    header: 'Options',
    optionList: argDefinitions
  }
];

async function main() {
  const args = commandLineArgs(argDefinitions);

  if (args['help']) {
    console.log(commandLineUsage(usage));
    process.exit();
  }

  global.args = args;

  const preset = await getPreset(args['region'], args['preset-id']);
  let res = Preset(preset, args['playlist-format']);

  res = removeEmpty(res);

  if (!global.args['camel']) {
    res = JSONCasing.toPascal(res);
  }

  process.stderr.write(JSON.stringify(global.messages, null, 2) + '\n\n');
  console.log(JSON.stringify(res, null, 2) + '\n');
}

main();
