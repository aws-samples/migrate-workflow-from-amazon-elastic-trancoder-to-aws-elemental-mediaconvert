/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const Job = require('./src/job');
const { loadJob } = require('./src/load-job');

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
    name: 'job-id',
    alias: 'i',
    description: 'The id of the Elastic Transcoder job for which to convert the settings.',
  },
  {
    name: 'region',
    alias: 'r',
    description: 'The AWS region in which the Elastic Transcoder job was run, e.g., us-east-1',
  },
  {
    name: 'role-arn',
    alias: 'a',
    description: 'The ARN of an IAM role to be used in the MediaConvert job settings.',
  },
  {
    name: 'name',
    alias: 'n',
    description: 'Optional. This option adds the `name` property to the result settings JSON. ' +
      'Name is required when creating a MediaConvert job template.'
  },
  {
    name: 'description',
    alias: 'd',
    description: 'Optional. This option adds the `description` property to the result settings ' +
      'JSON. Description is an optional field when creating a MediaConvert job template.'
  },
  {
    name: 'category',
    alias: 'c',
    description: 'Optional. This option adds the `category` property to the result settings ' +
      'JSON. Category is an optional field when creating a MediaConvert job template.'
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
  },
  {
    name: 'insert-defaults',
    type: Boolean,
    description: 'Optional. Insert default values for missing required settings. ' +
      'The default is false (don\'t insert).'
  }
];

/**
 * Command line usage info.
 */
const usage = [
  {
    content:
      'Converts Amazon Elastic Transcoder job settings to AWS Elemental MediaConvert job ' +
      'or job template settings. \n\n' +

      'When run with `--name` option, the converter outputs job template settings; otherwise, '  +
      'job settings. \n\n' +

      'For the conversion, this script calls Elastic Transcoder API to get the settings of the ' +
      'job and the pipeline. For each output of the job, the scripts makes an additional API ' +
      'call to get the settings of the preset of the output.'
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

  const job = await loadJob(args['region'], args['job-id']);
  const res = Job(job);

  process.stderr.write(JSON.stringify(global.messages, null, 2) + '\n\n');
  console.log(JSON.stringify(res, null, 2) + '\n');
}

main();
