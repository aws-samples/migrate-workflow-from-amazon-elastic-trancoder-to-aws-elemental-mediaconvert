/**
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

const { addInfoMessage } = require('./add-message');
const HlsContentProtection = require('./hls-content-protection');
const JobOutput = require('./job-output');
const { makeSidecarCaptionsOutputs } = require('./make-sidecar-captions-outputs');
const makeDestination = require('./make-destination');

/**
 * Converts an Elastic Transcoder playlist to a MediaConvert output group.
 *
 * @param {object} playlist The Elastic Transcoder playlist object.
 */
function Playlist(playlist) {

  let encryption = playlist.hlsContentProtection ?
    HlsContentProtection(playlist.hlsContentProtection) : null;

  // ETS outputs that are in this playlist.
  let etsOutputs = global.job.outputs.filter(output => playlist.outputKeys.includes(output.key));

  // Result MediaConvert outputs.
  let outputs = etsOutputs.map(output => JobOutput(output, playlist.format));

  // Sidecar captions
  outputs = [...outputs, ...makeSidecarCaptionsOutputs(etsOutputs[0], playlist.format)];

  // Gets the segment duration of the first output that has the setting.
  let segmentDuration = parseInt(
    etsOutputs.reduce((a, c) => a?.segmentDuration || c.segmentDuration, null)
  );

  if (segmentDuration) {
    addInfoMessage(
      playlist._path,
      'The converter uses the segment duration of the first output in the playlist that has the ' +
      'setting.'
    );
  }

  switch(playlist.format) {
    case 'HLSv3':
    case 'HLSv4':
      return {
        name: 'Apple HLS',
        outputGroupSettings: {
          type: 'HLS_GROUP_SETTINGS',
          hlsGroupSettings: {
            destination: makeDestination(),
            encryption: encryption,
            minSegmentLength: 0,
            segmentLength: segmentDuration
          }
        },
        outputs: outputs
      };

    case 'Smooth':
      return {
        name: 'MS Smooth',
        outputGroupSettings: {
          type: 'MS_SMOOTH_GROUP_SETTINGS',
          msSmoothGroupSettings: {
            destination: makeDestination(),
            fragmentLength: 2,
            encryption: encryption
          }
        },
        outputs: outputs
      };

    case 'MPEG-DASH':
      return {
        name: 'DASH ISO',
        outputGroupSettings: {
          type: 'DASH_ISO_GROUP_SETTINGS',
          dashIsoGroupSettings: {
            destination: makeDestination(),
            encryption: encryption,
            fragmentLength: 2,
            segmentLength: segmentDuration
          }
        },
        outputs: outputs
      };
  }
}

module.exports = Playlist;
