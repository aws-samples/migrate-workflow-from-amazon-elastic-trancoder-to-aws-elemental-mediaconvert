/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addInfoMessage } = require('./add-message');
const isSidecarCaptionsFormat = require('./is-sidecar-captions-format');
const iso6391To3 = require('./iso639-1-to-3');
const { playlistContainerMap } = require('./make-container-settings');

/**
 * Maps Elastic Transcoder output caption format type to MediaConvert output captions type.
 */
const captionsFormatMap = new Map([
  ['dfxp',   'TTML'],
  ['scc',    'SCC'],
  ['srt',    'SRT'],
  ['ttml',   'TTML'],
  ['webvtt', 'WEBVTT'],
]);

/**
 * Makes MediaConvert sidecar caption outputs.
 *
 * @param {object} output Elastic Transcoder output objects.
 * @param {string} playlistFormat Optional. Elastic Transcoder playlist format of the output.
 * @return {array} MediaConvert output objects.
 */
function makeSidecarCaptionsOutputs(output, playlistFormat) {
  if (!output) {
    return [];
  }

  // ETS caption sources of the first input
  const captionSources = job.inputs[0].inputCaptions?.captionSources ?? [];

  // ETS caption formats of the output
  const captionFormats = output.captions?.captionFormats.filter(
    format => isSidecarCaptionsFormat(format.format)
  ) ?? [];

  // MediaConvert caption selectors of the first input.
  const captionSelectorEntries = Object.entries(emcJob.settings.inputs[0].captionSelectors || {});

  // The result MediaConvert captions outputs.
  const res = [];

  // Handle embedded source.
  const embeddedCaptionsSelector = captionSelectorEntries.find(
    entry => entry[1].sourceSettings?.sourceType === 'EMBEDDED'
  );

  if (embeddedCaptionsSelector && captionFormats.length > 0) {
    addInfoMessage(output._path, 'Embedded captions source are not include in sidecar outputs.');
  }

  // Convert sidecar sources into sidecar output.
  captionSources.forEach(captionSource => {
    const captionSelector = captionSelectorEntries.find(
      entry => entry[1]?.sourceSettings?.fileSourceSettings?.sourceFile?.endsWith(captionSource.key)
    );

    if (!captionSelector) {
      return;
    }

    const languageCode = captionSource.language.length === 3 ?
      captionSource.language.toUpperCase() :
      iso6391To3.get(captionSource.language).toUpperCase();

    captionFormats.forEach(captionFormat => {
      res.push({
        nameModifier: `-${languageCode}`,
        containerSettings: {
          container: playlistContainerMap.has(playlistFormat) ?
            playlistContainerMap.get(playlistFormat) : 'RAW'
        },
        captionDescriptions: [
          {
            captionSelectorName: captionSelector[0],
            destinationSettings: {
              destinationType: captionsFormatMap.get(captionFormat.format),
            },
            languageCode,
            languageDescription: captionSource.label
          }
        ]
      });
    });
  });

  return res;
}

module.exports = {captionsFormatMap, makeSidecarCaptionsOutputs};
