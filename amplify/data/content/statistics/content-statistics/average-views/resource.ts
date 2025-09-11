import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const averageViewsFunction = defineFunction({
  name: 'average-views',
  environment: {
    CONTENT_TABLE: config.CONTENT_TABLE,
    REGION: config.REGION,
  },
});
