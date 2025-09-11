import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const topViewedContentFunction = defineFunction({
  name: 'top-viewed-content',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
