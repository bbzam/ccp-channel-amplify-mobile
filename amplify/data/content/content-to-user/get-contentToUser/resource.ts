import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const getContentToUserFunction = defineFunction({
  name: 'get-contentToUser',
  environment: {
    REGION: config.REGION,
    CONTENTTOUSER_TABLE: config.CONTENTTOUSER_TABLE,
  },
});
