import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const totalContentFunction = defineFunction({
  name: 'total-content',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
