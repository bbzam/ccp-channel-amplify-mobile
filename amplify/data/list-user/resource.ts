import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const listUser = defineFunction({
  name: 'list-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
