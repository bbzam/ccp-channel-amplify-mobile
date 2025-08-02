import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const createPaymentFunction = defineFunction({
  name: 'create-paymentFunction',
  environment: {
    REGION: config.REGION,
    CONTENT_TABLE: config.CONTENT_TABLE,
    PAYMENT_URL: config.PAYMENT_URL,
    MERCHANT_ID: config.MERCHANT_ID,
    API_KEY: config.API_KEY,
    PAYMENTTOUSER_TABLE: config.PAYMENTTOUSER_TABLE,
  },
});
