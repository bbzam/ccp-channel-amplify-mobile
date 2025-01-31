import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({

  Key: a
    .model({
      id: a.id().required(),
      code: a.string().required(),
      isUsed: a.boolean().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN', 'SUBSCRIBER'])
        .to(['create', 'update', 'delete']),
    ]),
});

export type keySchema = ClientSchema<typeof schema>;

export const key = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
