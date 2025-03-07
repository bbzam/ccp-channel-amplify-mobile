import { defineFunction } from '@aws-amplify/backend';
import { config } from '../config';

export const addUser = defineFunction({
  name: 'add-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
