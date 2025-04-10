import { defineStorage } from '@aws-amplify/backend';
import { onUpload } from './onUpload/resource';

export const storage = defineStorage({
  name: 'mystorage',
  triggers: {
    onUpload,
  },
  access: (allow) => ({
    // Landscape Images folder
    'landscape-images/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write', 'delete']),
      allow.resource(onUpload).to(['read', 'delete', 'write']),
    ],

    // Portrait Images folder
    'portrait-images/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write', 'delete']),
      allow.resource(onUpload).to(['read', 'delete', 'write']),
    ],

    // Preview Videos folder
    'preview-videos/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write', 'delete']),
      allow.resource(onUpload).to(['read', 'delete', 'write']),
    ],

    // Full Videos folder
    'full-videos/*': [
      // allow.authenticated.to(['read']),
      allow.groups(['SUBSCRIBER', 'USER']).to(['read']),
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']).to(['read', 'write', 'delete']),
      allow.resource(onUpload).to(['read', 'delete', 'write']),
    ],
  }),
});
