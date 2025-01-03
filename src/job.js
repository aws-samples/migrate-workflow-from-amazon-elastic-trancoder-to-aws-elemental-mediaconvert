/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { JSONCasing } = require('json-casing');
const JobInput = require('./job-input');
const makeFileOutputGroup = require('./make-file-output-group');
const makeThumbnails = require('./make-thumbnails');
const Playlist = require('./playlist');
const removeEmpty = require('./remove-empty');

/**
 * Converts an Elastic Transcoder job to a MediaConvert job.
 *
 * @param {object} job The ETS job.
 * @returns The converted EMF job.
 */
function Job(job) {
  // TODO: add message that the output file name have changed. See
  // https://docs.aws.amazon.com/mediaconvert/latest/ug/setting-up-a-job.html#specify-output-groups

  // The result MediaConvert job
  let res = global.emcJob = {
    name: global.args['name'],
    description: global.args['name'] && global.args['description'],
    category: global.args['name'] && global.args['category'],
    role: global.args['name'] ? null : global.args['role-arn'],
    settings: {
      inputs: job.inputs.map(input => JobInput(job, input))
    }
  };

  // MediaConvert output groups.
  let outputGroups = [];

  // Convert playlists into output groups
  if (job.playlists) {
    outputGroups = job.playlists.map(playlist => Playlist(playlist))
  }

  // Get the key of outputs that are already used by playlists
  let usedKeys = job.playlists?.map(playlist => playlist.outputKeys).flat() ?? [];

  // Get a list of remaining outputs that are not part of a playlist.
  let outputs = job.outputs.filter(output => !usedKeys.includes(output.key))

  // Convert remaining outputs to file output groups. The reason we convert each output to an
  // output group instead adding all outputs into one big output groups is that each Elastic
  // Transcoder output can have encryption settings, which is a feature of output group.
  outputGroups = [
    ...outputGroups,
    ...outputs.map(output => makeFileOutputGroup(output))
  ];

  // Add thumbnail outputs
  outputGroups = [
    ...outputGroups,
    ...job.outputs.map(output => makeThumbnails(output)).filter(outputGroup => !!outputGroup)
  ];

  res.settings.outputGroups = outputGroups;

  res = removeEmpty(res);

  if (!global.args['camel']) {
    res = JSONCasing.toPascal(res);
  }

  if (job.userMetadata && !global.args['name']) {
    res[global.args['camel'] ? 'userMetadata' : 'UserMetadata'] = job.userMetadata;
  }

  return res;
}

module.exports = Job;
