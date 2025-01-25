import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'mystorage',
  access: (allow) => ({
    // Landscape Images folder
    'landscape-images/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write']),
    ],

    // Portrait Images folder
    'portrait-images/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write']),
    ],

    // Preview Videos folder
    'preview-videos/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write']),
    ],

    // Full Videos folder
    'full-videos/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write']),
    ],
  }),
});
