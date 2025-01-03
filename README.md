# Migrate Workflow from Amazon Elastic Transcoder to AWS Elemental MediaConvert

This package contains scripts that converts Amazon Elastic Transcoder preset and job settings to AWS
Elemental MediaConvert preset and job settings.

For more info see https://aws.amazon.com/blogs/media/how-to-migrate-workflows-from-amazon-elastic-transcoder-to-aws-elemental-mediaconvert/

## Prerequisites

The followings are required to run the script:

- [Node.js](https://nodejs.org/) 14 or higher
- AWS CLI with configured credentials. For more info see https://docs.aws.amazon.com/streams/latest/dev/setup-awscli.html

## Usage

Before running the converter, run the following to install the dependencies:

```bash
npm install
```

The following shows examples of running the converter:

```bash
node convert-job.js \
  --region us-east-1 \
  --job-id 1234567890123-abcdef \
  --role-arn arn:aws:iam::123456789012:role/role-name
```

```bash
node convert-preset.js \
  --region us-east-1 \
  --preset-id 1351620000001-200025 \
  --playlist-format HLSv4
```

For the conversion, `convert-job.js` calls Elastic Transcoder API to get the settings of the job and
the pipeline. For each output of the job, the scripts makes an additional API call to get the
settings of the preset of the output.

The result MediaConvert job settings JSON is outputted to stdout. Informational messages are
outputted to stderr.

## Parameters

Run the following to get the script parameters.

```
node convert-job.js --help

node convert-preset.js --help
```

## Informational Messages

The scripts outputs a list of information messages as a JSON array to stderr. Each message has the
following fields:

- `level`: signifies the type of the message.
  - `INFO`: low severity messages.
  - `WARN`: settings might have changed during the conversion.
  - `ERROR`: the converter is unable to produce comparable MediaConvert settings.
- `path`: the location in the Elastic Transcoder settings where the message occurred.
- `message`: the actual message.

## Examples

### Creating a MediaConvert Job

Example of creating a new MediaConvert job from an existing Elastic Transcoder job.

```bash
# Get MediaConvert job settings from Elastic Transcoder job.
node convert-job.js \
  --region us-west-2 \
  --job-id 1234567890123-abcdef \
  --role-arn arn:aws:iam::123456789012:role/role-name \
  > mediaconvert-job.json

# Create a new MediaConvert job
aws mediaconvert create-job --region us-west-2 --cli-input-json file://mediaconvert-job.json
```

### Creating a MediaConvert Job Template

Example of creating a new MediaConvert job template from an existing Elastic Transcoder job.

```bash
# Get MediaConvert job template settings from Elastic Transcoder job.
node convert-job.js \
  --region us-west-2 \
  --job-id 1234567890123-abcdef \
  --name 'HLS_AV_1M_1.5M' \
  --description 'HLS AV 1M, 1.5M' \
  --category 'HLS' \
  > mediaconvert-job-template.json

# Create a new MediaConvert job
aws mediaconvert create-job-template \
  --region us-west-2 \
  --cli-input-json file://mediaconvert-job-template.json
```

### Creating a MediaConvert Preset

Example of creating a new MediaConvert preset from an existing Elastic Transcoder preset.

```bash
# Get MediaConvert preset settings
node convert-preset.js \
  --region us-west-2 \
  --preset-id 1351620000001-200025 \
  --playlist-format HLSv4 \
  | jq .[0] \
  > mediaconvert-preset.json

# Calls MediaConvert API to create the preset
aws mediaconvert create-preset --region us-west-2 --cli-input-json file://mediaconvert-preset.json
```

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

