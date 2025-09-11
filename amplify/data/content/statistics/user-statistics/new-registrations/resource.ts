import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const newRegistrationsFunction = defineFunction({
  name: 'new-registrations',
  environment: {
    USER_POOL_ID: config.USER_POOL_ID,
    REGION: config.REGION,
  },
});
