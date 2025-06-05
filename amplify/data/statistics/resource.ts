import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../config';

export const statistics = defineFunction({
  name: 'statistics',
  environment: {
    REGION: config.REGION,
  },
});
