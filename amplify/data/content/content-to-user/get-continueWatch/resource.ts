import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const getContinueWatchFunction = defineFunction({
  name: 'get-continueWatch',
  environment: {
    REGION: config.REGION,
    CONTENTTOUSER_TABLE: config.CONTENTTOUSER_TABLE,
  },
});
