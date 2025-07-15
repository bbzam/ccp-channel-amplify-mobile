import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const createContentFunction = defineFunction({
  name: 'create-ContentFunction',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
    CUSTOMFIELDS_TABLE: config.CUSTOMFIELDS_TABLE,
  },
});
