import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const statistics = defineFunction({
  name: 'statistics',
  environment: {
    USER_POOL_ID: config.USER_POOL_ID,
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
