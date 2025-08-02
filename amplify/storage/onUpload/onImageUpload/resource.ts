import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const onImageUpload = defineFunction({
  name: 'on-image-upload',
  layers: {
    'sharp-layer': `arn:aws:lambda:${config.REGION}:${config.ACCOUNT_ID}:layer:${config.SHARP_LAYER}`,
  },
});
