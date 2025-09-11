import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const groupCountsFunction = defineFunction({
  name: 'group-counts',
  environment: {
    USER_POOL_ID: config.USER_POOL_ID,
    REGION: config.REGION,
    PAYMENTTOUSER_TABLE: config.PAYMENTTOUSER_TABLE,
  },
});
