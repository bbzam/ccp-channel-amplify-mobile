import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  UserRole: a.enum(['USER', 'CONTENT_CREATOR', 'SUPER_ADMIN']),

  Content: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      description: a.string().required(),
      category: a.string().required(),
      subCategory: a.string(),
      director: a.string(),
      writer: a.string(),
      userType: a.string().required(),
      landscapeImageUrl: a.string().required(),
      portraitImageUrl: a.string().required(),
      previewVideoUrl: a.string().required(),
      fullVideoUrl: a.string().required(),
      runtime: a.integer(),
      resolution: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['create', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
