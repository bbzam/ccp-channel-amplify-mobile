import { defineStorage } from '@aws-amplify/backend';
import { onImageUpload } from './onUpload/onImageUpload/resource';
import { onPreviewVideoUpload } from './onUpload/onPreviewVideoUpload/resource';
import { onFullVideoUpload } from './onUpload/onFullVideoUpload/resource';
import { createVttFunction } from './create-vtt/resource';

export const storage = defineStorage({
  name: 'mystorage',
  // triggers: {
  //   onUpload,
  // },
  access: (allow) => ({
    // Landscape Images folder
    'landscape-images/*': [
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onImageUpload).to(['read', 'delete', 'write']),
    ],

    // Portrait Images folder
    'portrait-images/*': [
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onImageUpload).to(['read', 'delete', 'write']),
    ],

    // Preview Videos folder
    'preview-videos/*': [
      allow.groups(['SUBSCRIBER', 'FREE_SUBSCRIBER']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onPreviewVideoUpload).to(['read', 'delete', 'write']),
    ],

    // Full Videos folder
    'full-videos/*': [
      allow.groups(['SUBSCRIBER', 'FREE_SUBSCRIBER']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onFullVideoUpload).to(['read', 'delete', 'write']),
    ],

    // Flattened Landscape Images folder
    'processed-landscape-images/*': [
      allow.groups(['SUBSCRIBER', 'FREE_SUBSCRIBER']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onImageUpload).to(['read', 'delete', 'write']),
    ],

    // Flattened Portrait Images folder
    'processed-portrait-images/*': [
      allow.groups(['SUBSCRIBER', 'FREE_SUBSCRIBER']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onImageUpload).to(['read', 'delete', 'write']),
    ],

    // Processed Full Videos folder
    'processed-full-videos/*': [
      allow.groups(['SUBSCRIBER', 'FREE_SUBSCRIBER']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'write', 'delete']),
      allow.resource(onFullVideoUpload).to(['read', 'delete', 'write']),
      allow.resource(createVttFunction).to(['read', 'write']),
    ],
  }),
});
