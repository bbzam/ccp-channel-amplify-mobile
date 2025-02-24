import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
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
      runtime: a.float(),
      resolution: a.string(),
      status: a.boolean(),//published or scheduled
      publishDate: a.date(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['create', 'update', 'delete']),
    ]),
  Keys: a
    .model({
      id: a.id().required(),
      isUsed: a.boolean().required(),
    })
    .authorization((allow) => [
      allow.guest().to(['update', 'read']),
      allow.groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR']).to(['create', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
