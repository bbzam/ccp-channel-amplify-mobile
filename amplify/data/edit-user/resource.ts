import { defineFunction } from '@aws-amplify/backend';
import { config } from '../config';

export const editUser = defineFunction({
  name: 'edit-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
