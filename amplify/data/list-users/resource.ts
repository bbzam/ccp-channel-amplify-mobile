import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const listUsers = defineFunction({
  name: 'list-users',
  environment: {
    UserPoolId: config.USER_POOL_ID,
    Region: config.REGION,
  },
});
