import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const contentStatistics = defineFunction({
  name: 'content-statistics',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
