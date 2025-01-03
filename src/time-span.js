/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require('./add-message');

/**
 * Elastic Transcoder input clips documentation.
 */
const etsDocs = 'https://docs.aws.amazon.com/elastictranscoder/latest/developerguide/job-settings.html#job-settings-input-details-part-2';

/**
 * Elastic Transcoder accept time pattern.
 */
const etsTimePattern = /(^\d{1,5}(\.\d{0,3})?$)|(^([0-1]?[0-9]:|2[0-3]:)?([0-5]?[0-9]:)?[0-5]?[0-9](\.\d{0,3})?$)/;

/**
 * Converts Elastic Transcoder TimeSpan object to MediaConvert an array of InputClipping objects.
 *
 * @param {object} timeSpan The Elastic Transcoder TimeSpan model object.
 * @returns {object} The result object.
 */
function TimeSpan(timeSpan) {
  if (!timeSpan || (!timeSpan.startTime && !timeSpan.duration)) {
    return;
  }

  let startTime = timeSpan.startTime?.trim();
  let duration = timeSpan.duration?.trim();

  // Validate startTime
  if (startTime && !startTime.match(etsTimePattern)) {
    addWarnMessage(
      [...timeSpan._path, 'startTime'],
      `StartTime is ill-formatted. For more info see ${etsDocs}`
    );
    return;
  }

  // Validate duration
  if (duration && !duration.match(etsTimePattern)) {
    addWarnMessage(
      [...timeSpan._path, 'duration'],
      `StartTime is ill-formatted. For more info see ${etsDocs}`
    );
    return;
  }

  // Check if startTime has fractional seconds.
  // MediaConvert supports SMPTE timecode that contains frame number, but not fractional seconds.
  if (startTime && startTime.includes('.')) {
    addWarnMessage(
      [...timeSpan._path, 'startTime'],
      'MediaConvert supports SMPTE timecode that contains frame number, but not fractional seconds, which has been omitted.'
    );
  }

  if (duration && duration.includes('.')) {
    addWarnMessage(
      [...timeSpan._path, 'duration'],
      'MediaConvert supports SMPTE timecode that contains frame number, but not fractional seconds, which has been omitted.'
    );
  }

  // Start time in seconds
  const startSeconds = startTime ? toSeconds(startTime) : null;

  // End time in seconds
  const endSeconds = duration ? toSeconds(duration) : null;

  return [{
    startTimecode: startTime ? toTimecode(startSeconds) : null,
    endTimecode: duration ? toTimecode(startSeconds + endSeconds) : null
  }];
}

/**
 * Converts Elastic Transcoder timecode to the number of seconds.
 *
 * @param {string} timecode The timecode to convert to seconds.
 * @return {integer} The result in seconds or undefined if timecode is invalid.
 */
function toSeconds(timecode) {
  if (typeof timecode !== 'string') {
    return;
  }

  let tc = timecode;

  // Remove fractional portion.
  if (tc.includes('.')) {
    tc = tc.substring(0, tc.indexOf('.'));
  }

  // Remove leading + or -
  if (tc.startsWith('+') || tc.startsWith('-')) {
    tc = tc.substring(1);
  }

  let parts = tc.split(':');
  parts = [...(new Array(3 - parts.length).fill(0)), ...parts].map(e => parseInt(e));
  return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * (timecode.startsWith('-') ? -1 : 1);
}

/**
 * Converts Elastic Transcode timecode to milliseconds.
 *
 * @param {string} timecode The timecode to convert to milliseconds.
 * @return {integer} The number of milliseconds or undefined if timecode is invalid.
 */
function toMillis(timecode) {
  if (typeof timecode !== 'string') {
    return;
  }

  // The fractional part of timecode
  const index = timecode.indexOf('.');
  const fraction = parseInt(index > -1 ? timecode.substring(index + 1).padEnd(3, '0') : '0') *
    (timecode.startsWith('-') ? -1 : 1);

  return toSeconds(timecode) * 1000 + (fraction || 0);
}

/**
 * Converts seconds to timecode.
 *
 * @param {integer} seconds The number of seconds
 * @return {string} The result timecode.
 */
function toTimecode(seconds) {
  const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
  seconds = seconds % 3600;
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  seconds = seconds % 60;
  seconds = seconds.toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}:00`;
}

module.exports = {
  TimeSpan,
  toSeconds,
  toMillis,
  toTimecode
};
