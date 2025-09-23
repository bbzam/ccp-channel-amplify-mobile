import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../config';

export const resendInvitation = defineFunction({
  name: 'resend-invitation',
  environment: {
    UserPoolId: config.USER_POOL_ID,
  },
});
