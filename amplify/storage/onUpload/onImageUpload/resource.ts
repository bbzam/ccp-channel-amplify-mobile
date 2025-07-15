import { defineFunction } from '@aws-amplify/backend';

export const onImageUpload = defineFunction({
  name: 'on-image-upload',
  layers: {
    'sharp-layer':
      'arn:aws:lambda:ap-southeast-1:879639852836:layer:node-js-sharp:1',
  },
});
