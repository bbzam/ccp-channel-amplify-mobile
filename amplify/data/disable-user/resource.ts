import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const disableUser = defineFunction({
  name: 'disable-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
