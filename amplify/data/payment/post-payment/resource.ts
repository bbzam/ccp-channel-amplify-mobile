import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const postPaymentFunction = defineFunction({
  name: 'post-paymentFunction',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
