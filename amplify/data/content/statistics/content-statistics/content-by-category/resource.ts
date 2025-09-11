import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const contentByCategoryFunction = defineFunction({
  name: 'content-by-category',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
