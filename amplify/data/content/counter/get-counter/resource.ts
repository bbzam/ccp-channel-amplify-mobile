import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const getCountersFunction = defineFunction({
  name: 'get-counters',
  environment: {
    REGION: config.REGION,
    COUNTER_TABLE: config.COUNTER_TABLE,
  },
});
