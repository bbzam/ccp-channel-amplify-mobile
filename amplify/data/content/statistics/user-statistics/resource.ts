import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const userStatistics = defineFunction({
  name: 'user-statistics',
  environment: {
    USER_POOL_ID: config.USER_POOL_ID,
    REGION: config.REGION,
  },
});
