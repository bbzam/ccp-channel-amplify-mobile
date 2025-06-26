import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const updateContentToUserFunction = defineFunction({
  name: 'update-contentToUser',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
