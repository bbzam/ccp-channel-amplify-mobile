import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const enableUser = defineFunction({
  name: 'enable-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
