import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { addUser } from './auth/add-user/resource';
import { listUsers } from './auth/list-users/resource';
import { editUser } from './auth/edit-user/resource';
import { disableUser } from './auth/disable-user/resource';
import { enableUser } from './auth/enable-user/resource';
import { listUser } from './auth/list-user/resource';
import { statistics } from './content/statistics/resource';
import { getContentToUserFunction } from './content/content-to-user/get-contentToUser/resource';
import { updateContentToUserFunction } from './content/content-to-user/update-contentToUser/resource';
import { createContentToUserFunction } from './content/content-to-user/create-contentToUser/resource';
import { getUserFavoritesFunction } from './content/content-to-user/get-userFavorites/resource';
import { getContinueWatchFunction } from './content/content-to-user/get-continueWatch/resource';

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
      viewCount: a.integer(),
      customFields: a.json(),
      contentToUser: a.hasMany('contentToUser', 'contentId'),
    })
    .authorization((allow) => [
      allow.authenticated().to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['create', 'update', 'delete']),
    ]),

  customFields: a
    .model({
      fieldName: a.string().required(),
    })
    .authorization((allow) => [
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['read', 'create', 'update', 'delete']),
      allow.groups(['USER', 'SUBSCRIBER']).to(['read']),
    ]),

  contentToUser: a
    .model({
      userId: a.string().required(),
      pauseTime: a.string(),
      isFavorite: a.boolean(),
      contentId: a.id().required(),
      content: a.belongsTo('Content', 'contentId'),
    })
    .authorization((allow) => [
      allow.groups(['USER', 'SUBSCRIBER']).to(['create', 'update', 'read']),
      allow.groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR']).to(['read']),
    ]),

  createContentToUserFunction: a
    .mutation()
    .arguments({
      contentId: a.string().required(),
      pauseTime: a.string(),
      isFavorite: a.boolean(),
    })
    .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
    .handler(a.handler.function(createContentToUserFunction))
    .returns(a.json()),

  getContentToUserFunction: a
    .query()
    .arguments({
      contentId: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
    .handler(a.handler.function(getContentToUserFunction))
    .returns(a.json()),

  getUserFavoritesFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
    .handler(a.handler.function(getUserFavoritesFunction))
    .returns(a.json()),

  getContinueWatchFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
    .handler(a.handler.function(getContinueWatchFunction))
    .returns(a.json()),

  // updateContentToUser: a
  //   .mutation()
  //   .arguments({
  //     data: a.json().required(),
  //   })
  //   .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
  //   .handler(a.handler.function(updateContentToUser))
  //   .returns(a.json()),

  // incrementViewCount: a
  //   .mutation()
  //   .arguments({
  //     contentId: a.string().required(),
  //   })
  //   .authorization((allow) => [allow.groups(['USER', 'SUBSCRIBER'])])
  //   .handler(a.handler.function(incrementViewcount))
  //   .returns(a.json()),

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

  statistics: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(statistics))
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
