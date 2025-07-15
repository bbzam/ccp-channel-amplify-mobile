import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const getContentFunction = defineFunction({
  name: 'get-ContentFunction',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
    CONTENTTOUSER_TABLE: config.CONTENTTOUSER_TABLE,
  },
});
