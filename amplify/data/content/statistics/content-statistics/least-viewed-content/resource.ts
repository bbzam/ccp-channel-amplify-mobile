import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const leastViewedContentFunction = defineFunction({
  name: 'least-viewed-content',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
