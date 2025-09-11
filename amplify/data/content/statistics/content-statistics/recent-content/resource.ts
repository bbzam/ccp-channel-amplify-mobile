import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const recentContentFunction = defineFunction({
  name: 'recent-content',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
