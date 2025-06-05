import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { addUser } from './add-user/resource';
import { listUsers } from './list-users/resource';
import { editUser } from './edit-user/resource';
import { disableUser } from './disable-user/resource';
import { enableUser } from './enable-user/resource';
import { listUser } from './list-user/resource';

const schema = a.schema({
  Content: a
    .model({
      id: a.id().required(),
      title: a.string().required(),
      description: a.string().required(),
      category: a.enum([
        'theater',
        'film',
        'music',
        'dance',
        'education',
        'ccpspecials',
        'ccpclassics',
      ]),
      subCategory: a.string(),
      director: a.string(),
      writer: a.string(),
      yearReleased: a.string(),
      userType: a.enum(['free', 'subscriber']),
      landscapeImageUrl: a.string().required(),
      portraitImageUrl: a.string().required(),
      previewVideoUrl: a.string().required(),
      fullVideoUrl: a.string().required(),
      runtime: a.float().required(),
      resolution: a.string().required(),
      status: a.boolean().required(), //published or scheduled
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

  FeaturedAll: a
    .model({
      id: a.id().required(),
      selectedContent: a.string(),
      category: a.enum([
        'all',
        'theater',
        'film',
        'music',
        'dance',
        'education',
        'ccpspecials',
        'ccpclassics',
      ]),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.groups(['USER', 'SUBSCRIBER']).to(['read']),
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['create', 'read', 'update', 'delete']),
    ]),

  tags: a
    .model({
      tag: a.string(),
      isVisible: a.boolean(),
      selectedContent: a.string(),
    })
    .authorization((allow) => [
      allow.groups(['USER', 'SUBSCRIBER']).to(['read']),
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['create', 'read', 'update', 'delete']),
    ]),

  FeaturedLandingPage: a
    .model({
      selectedContent: a.string(),
      category: a.enum([
        'theater',
        'film',
        'music',
        'dance',
        'education',
        'ccpspecials',
        'ccpclassics',
      ]),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.groups(['USER', 'SUBSCRIBER']).to(['read']),
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

  listUser: a
    .query()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [
      allow.groups([
        'USER',
        'SUBSCRIBER',
        'CONTENT_CREATOR',
        'IT_ADMIN',
        'SUPER_ADMIN',
      ]),
    ])
    .handler(a.handler.function(listUser))
    .returns(a.json()),

  listUsers: a
    .query()
    .arguments({
      role: a.string().required(),
      limit: a.string(),
      keyword: a.string(),
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
