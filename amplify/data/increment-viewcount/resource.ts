import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const incrementViewcount = defineFunction({
  name: 'increment-viewcount',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
