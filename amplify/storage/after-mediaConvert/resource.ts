import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const afterMediaConvertFunction = defineFunction({
  name: 'after-mediaConvert',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
