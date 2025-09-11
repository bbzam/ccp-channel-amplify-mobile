import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const monthlyStatsFunction = defineFunction({
  name: 'monthly-stats',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
