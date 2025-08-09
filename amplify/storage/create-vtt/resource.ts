import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const createVttFunction = defineFunction({
  name: 'create-vtt',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
  layers: {
    ffmpeg: `arn:aws:lambda:${config.REGION}:${config.ACCOUNT_ID}:layer:${config.FFMPEG_LAYER}`,
  },
  memoryMB: 3008, //original value is 3072 but change to 3008 as this aws account is still new, i.e. requires service limit increase
  ephemeralStorageSizeMB: 10240, // default is 512 MB
  timeoutSeconds: 900,
});
