import { defineFunction } from '@aws-amplify/backend';
import { auth } from '../../../amplify_outputs.json';

export const addUser = defineFunction({
  name: 'add-user',
  environment: {
    UserPoolId: auth.user_pool_id,
  },
});
