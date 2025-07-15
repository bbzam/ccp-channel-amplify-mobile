import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const createContentToUserFunction = defineFunction({
  name: 'create-contentToUser',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
    CONTENTTOUSER_TABLE: config.CONTENTTOUSER_TABLE,
  },
});
