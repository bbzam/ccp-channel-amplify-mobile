import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const createVttFunction = defineFunction({
  name: 'create-vtt',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
  layers: {
    ffmpeg: `arn:aws:lambda:${config.REGION}:${config.ACCOUNT_ID}:layer:ffmpeg:2`,
  },
  memoryMB: 3072, // default is 128MB. Max is 10240 (10 GB)
  ephemeralStorageSizeMB: 10240, // default is 512 MB
  timeoutSeconds: 900,
});
