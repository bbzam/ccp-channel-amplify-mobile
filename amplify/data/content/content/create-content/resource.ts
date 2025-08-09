import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const createContentFunction = defineFunction({
  name: 'create-ContentFunction',
  environment: {
    BUCKET_NAME: config.BUCKET_NAME,
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
    CUSTOMFIELDS_TABLE: config.CUSTOMFIELDS_TABLE,
    MEDIACONVERT_ROLE: `arn:aws:iam::${config.ACCOUNT_ID}:${config.MEDIACONVERT_ROLE}`,
    SPEKE_URL: config.SPEKE_URL,
  },
});
