import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { addUser } from './add-user/resource';
import { listUsers } from './list-users/resource';
import { editUser } from './edit-user/resource';
import { disableUser } from './disable-user/resource';
import { enableUser } from './enable-user/resource';

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
      status: a.boolean(), //published or scheduled
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
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['create', 'read', 'update', 'delete']),
    ]),

  addUser: a
    .mutation()
    .arguments({
      firstname: a.string().required(),
      lastname: a.string().required(),
      email: a.string().required(),
      birthdate: a.string().required(),
      role: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(addUser))
    .returns(a.json()),

  listUsers: a
    .query()
    .arguments({
      role: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(listUsers))
    .returns(a.json()),

  editUser: a
    .mutation()
    .arguments({
      firstname: a.string().required(),
      lastname: a.string().required(),
      email: a.string().required(),
      birthdate: a.string().required(),
      role: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(editUser))
    .returns(a.json()),

  disableUser: a
    .mutation()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(disableUser))
    .returns(a.json()),

  enableUser: a
    .mutation()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(enableUser))
    .returns(a.json()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
