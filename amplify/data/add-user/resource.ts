import { defineFunction } from '@aws-amplify/backend';
import { environment } from '../../../src/environments/environment';

export const addUser = defineFunction({
  name: 'add-user',
  environment: {
    UserPoolId: environment.USER_POOL_ID,
  },
});
