/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const {
  ElasticTranscoderClient,
  ReadJobCommand,
  ReadPipelineCommand,
  ReadPresetCommand
} = require('@aws-sdk/client-elastic-transcoder');
const { JSONCasing } = require('json-casing');
const addPath = require('./add-path');

/**
 * Calls the Elastic Transcoder API to get the job and referenced presets.
 *
 * This function will set `global.job` and `global.presets`.
 *
 * @param {string} region The AWS region to call the API.
 * @param {string} jobId The Elastic Transcoder job id.
 * @return {object} The job object.
 */
async function loadJob(region, jobId) {
  let job = await getJob(region, jobId);
  let presets = {};
  let pipeline = await getPipeline(region, job.pipelineId);

  for (let output of job.outputs) {
    let preset = await getPreset(region, output.presetId);
    presets[output.presetId] = preset;
  }

  global.job = job;
  global.pipeline = pipeline;
  global.presets = presets;

  return job;
}

/**
 * Calls the Elastic Transcoder API to get a job.
 *
 * @param {string} region The AWS API region.
 * @param {string} presetId The id of the preset to get.
 * @return {object} The job object.
 */
async function getJob(region, jobId) {
  if (args['verbose']) {
    process.stderr.write(`Getting job: region=${region}, jobId=${jobId}\n`);
  }

  let client = new ElasticTranscoderClient({region});
  let command = new ReadJobCommand({Id: jobId});
  let response = await client.send(command);
  let job = JSONCasing.toCamel(response.Job);

  if (args['verbose']) {
    process.stderr.write(`Get job response: ${JSON.stringify(response, null, 2)}\n\n`);
  }

  return {...addPath(job, ['job']), userMetadata: response.Job.UserMetadata};
}

/**
 * Calls the Elastic Transcoder API to get a preset.
 *
 * @param {string} region The AWS API region.
 * @param {string} presetId The id of the preset to get.
 * @return {object} The preset object.
 */
async function getPreset(region, presetId) {
  if (args['verbose']) {
    process.stderr.write(`Getting preset: region=${region}, presetId=${presetId}\n`);
  }

  let client = new ElasticTranscoderClient({region});
  let command = new ReadPresetCommand({Id: presetId});
  let response = await client.send(command);
  let preset = JSONCasing.toCamel(response.Preset);

  if (args['verbose']) {
    process.stderr.write(`Get preset response: ${JSON.stringify(response, null, 2)}\n\n`);
  }

  return addPath(preset, ['preset', preset.name]);
}

/**
 * Calls the Elastic Transcoder API to get a pipeline.
 *
 * @param {string} region The AWS region.
 * @param {string} pipelineId The ID of the pipeline.
 * @returns The pipeline object.
 */
async function getPipeline(region, pipelineId) {
  if (args['verbose']) {
    process.stderr.write(`Getting pipeline: region=${region}, pipelineId=${pipelineId}\n`);
  }

  let client = new ElasticTranscoderClient({region});
  let command = new ReadPipelineCommand({Id: pipelineId});
  let response = await client.send(command);
  let pipeline = JSONCasing.toCamel(response.Pipeline);

  if (args['verbose']) {
    process.stderr.write(`Get pipeline response: ${JSON.stringify(response, null, 2)}\n\n`);
  }

  return pipeline;
}

module.exports = {loadJob, getJob, getPreset, getPipeline};
