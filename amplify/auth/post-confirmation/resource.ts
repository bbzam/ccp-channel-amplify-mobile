import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  // optionally define an environment variable for your group name
  environment: {
    GROUP_NAME: 'USER',
    COUNTER_TABLE: config.COUNTER_TABLE,
  },
});
