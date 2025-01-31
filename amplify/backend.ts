import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { key } from './key/resource';

defineBackend({
  auth,
  data,
  storage,
  key,
});
