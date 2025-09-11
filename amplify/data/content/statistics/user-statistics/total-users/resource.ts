import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../../config';

export const totalUsersFunction = defineFunction({
  name: 'total-users',
  environment: {
    USER_POOL_ID: config.USER_POOL_ID,
    REGION: config.REGION,
  },
});
