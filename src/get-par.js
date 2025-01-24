/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addWarnMessage } = require("./add-message");
const getResolution = require("./get-resolution");

const aspectRatioRegex = /^\d+:\d+$/;

/**
 * Converts Elastic Transcoder video resolution and aspect ratio to MediaConvert pixel aspect ratio
 * (PAR) settings.
 *
 * @param {object} videoParams Elastic Transcoder video param object.
 * @return {object} An object with 2 properties that denotes result PAR settings: parNumerator and
 * parDenominator. If there are no PAR settings, undefined is returned.
 */
function getPar(videoParams) {
  if (!videoParams) {
    return;
  }

  return getParFromDisplayAspectRatio(videoParams) ?? getParFromAspectRatio(videoParams);
}

/**
 * Converts Elastic Transcoder aspect ratio settings to MediaConvert PAR settings.
 *
 * @param {object} videoParams Elastic Transcoder video param object.
 * @return {object} An object with the format {parNumerator, parDenominator} or undefined.
 */
function getParFromAspectRatio(videoParams) {
  if (
    typeof videoParams.aspectRatio !== 'string' ||
    !videoParams.aspectRatio.match(aspectRatioRegex)
  ) {
    return;
  }

  const parts = videoParams.aspectRatio.split(':').map(part => parseInt(part));
  const resolution = getResolution(videoParams.resolution);

  if (isNaN(resolution?.width) || isNaN(resolution?.height)) {
    addWarnMessage(
      [...videoParams._path, 'aspectRatio'],
      'Video aspect ratio cannot be converted to pixel aspect ratio without resolution. ' +
      'Video `aspectRatio` setting is ignored.'
    );

    return;
  }

  const res = darToPar(resolution.width, resolution.height, parts[0], parts[1]);

  if (!isFinite(res.parNumerator) || !isFinite(res.parDenominator) || res.parNumerator < 1 ||
    res.parDenominator < 1)
  {
    addWarnMessage(
      [...videoParams._path, 'aspectRatio'],
      'Video aspect ratio cannot be converted to pixel aspect ratio. ' +
      'Video `aspectRatio` setting is ignored.'
    );

    return;
  }

  return res;
}

/**
 * Converts Elastic Transcoder display aspect ratio settings to MediaConvert PAR settings.
 *
 * @param {object} videoParams Elastic Transcoder video param object.
 * @return {object} An object with the format {parNumerator, parDenominator} or undefined.
 */
function getParFromDisplayAspectRatio(videoParams) {
  const displayAspectRatio = videoParams.displayAspectRatio;

  if (typeof displayAspectRatio !== 'string' || !displayAspectRatio.match(aspectRatioRegex)) {
    return;
  }

  const parts = displayAspectRatio.split(':').map(part => parseInt(part));
  const maxWidth = parseInt(videoParams.maxWidth);
  const maxHeight = parseInt(videoParams.maxHeight);

  if (
    (videoParams.sizingPolicy !== 'Stretch' && videoParams.paddingPolicy !== 'Pad') ||
    isNaN(maxWidth) ||
    isNaN(maxHeight))
  {
    addWarnMessage(
      [...videoParams._path, 'displayAspectRatio'],
      'Video display aspect ratio cannot be converted to pixel aspect ratio without definite video resolution. ' +
      'Video `displayAspectRatio` setting is ignored.'
    );

    return;
  }

  const res = darToPar(maxWidth, maxHeight, parts[0], parts[1]);

  if (!isFinite(res.parNumerator) || !isFinite(res.parDenominator) || res.parNumerator < 1 ||
  res.parDenominator < 1)
  {
    addWarnMessage(
      [...videoParams._path, 'displayAspectRatio'],
      'Video aspect ratio cannot be converted to pixel aspect ratio. ' +
      'Video `displayAspectRatio` setting is ignored.'
    );

    return;
  }

  return res;
}

/**
 * Converts resolution and display aspect ratio (DAR) to pixel aspect ratio (PAR).
 *
 * @param {number} w Video resolution width.
 * @param {number} h Video resolution height.
 * @param {number} dw DAR width.
 * @param {number} dh DAR height.
 * @return {object} An object with the format {parNumerator, parDenominator}.
 */
function darToPar(w, h, dw, dh) {
  const parNumerator = dw * h;
  const parDenominator = dh * w;
  const divisor = gcd(parNumerator, parDenominator);

  return {
    parNumerator: parNumerator / divisor,
    parDenominator: parDenominator / divisor
  };
}

/**
 * Finds the greatest common divisor (GCD) of 2 integers.
 *
 * @param {number} a The first number
 * @param {number} b The second number
 * @return {number} The GCD.
 */
function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

module.exports = {
  getPar,
  getParFromAspectRatio,
  getParFromDisplayAspectRatio,
  darToPar,
  gcd,
};
