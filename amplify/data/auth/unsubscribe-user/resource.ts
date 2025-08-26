import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const unsubscribeUser = defineFunction({
  name: 'unsubscribe-user',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
