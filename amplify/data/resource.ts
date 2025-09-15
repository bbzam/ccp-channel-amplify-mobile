import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { addUser } from './auth/add-user/resource';
import { listUsers } from './auth/list-users/resource';
import { editUser } from './auth/edit-user/resource';
import { disableUser } from './auth/disable-user/resource';
import { enableUser } from './auth/enable-user/resource';
import { listUser } from './auth/list-user/resource';
// import { statistics } from './content/statistics/resource';
import { getContentToUserFunction } from './content/content-to-user/get-contentToUser/resource';
import { createContentToUserFunction } from './content/content-to-user/create-contentToUser/resource';
import { getUserFavoritesFunction } from './content/content-to-user/get-userFavorites/resource';
import { getContinueWatchFunction } from './content/content-to-user/get-continueWatch/resource';
import { createContentFunction } from './content/content/create-content/resource';
import { updateContentFunction } from './content/content/update-content/resource';
import { getContentFunction } from './content/content/get-content/resource';
import { createPaymentFunction } from './payment/create-payment/resource';
import { userStatistics } from './content/statistics/user-statistics/resource';
import { contentStatistics } from './content/statistics/content-statistics/resource';
import { unsubscribeUser } from './auth/unsubscribe-user/resource';
import { totalUsersFunction } from './content/statistics/user-statistics/total-users/resource';
import { groupCountsFunction } from './content/statistics/user-statistics/group-counts/resource';
import { newRegistrationsFunction } from './content/statistics/user-statistics/new-registrations/resource';
import { totalContentFunction } from './content/statistics/content-statistics/total-content/resource';
import { topViewedContentFunction } from './content/statistics/content-statistics/top-viewed-content/resource';
import { contentByCategoryFunction } from './content/statistics/content-statistics/content-by-category/resource';
import { leastViewedContentFunction } from './content/statistics/content-statistics/least-viewed-content/resource';
import { averageViewsFunction } from './content/statistics/content-statistics/average-views/resource';
import { recentContentFunction } from './content/statistics/content-statistics/recent-content/resource';
import { monthlyStatsFunction } from './content/statistics/content-statistics/monthly-stats/resource';

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
      vttUrl: a.string(),
      processedFullVideoUrl: a.string(),
      runtime: a.float().required(),
      resolution: a.string().required(),
      status: a.boolean().required(), //scheduled (false), published (true)
      publishDate: a.date(),
      viewCount: a.integer(),
      customFields: a.json(),
      contentToUser: a.hasMany('contentToUser', 'contentId'),
    })
    .authorization((allow) => [
      allow.groups(['SUBSCRIBER', 'IT_ADMIN']).to(['read']),
      allow
        .groups(['CONTENT_CREATOR', 'SUPER_ADMIN'])
        .to(['read', 'create', 'update', 'delete']),
    ]),

  getContentFunction: a
    .query()
    .arguments({
      category: a.string(),
      status: a.boolean(),
      keyword: a.string(),
      fields: a.string().array(),
      filterBy: a.json(),
    })
    .returns(a.string())
    .handler(a.handler.function(getContentFunction))
    .authorization((allow) => [
      allow.groups([
        'SUBSCRIBER',
        'CONTENT_CREATOR',
        'IT_ADMIN',
        'SUPER_ADMIN',
      ]),
    ]),

  createContentFunction: a
    .mutation()
    .arguments({
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
      status: a.boolean().required(),
      publishDate: a.date(),
      customFields: a.json(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(createContentFunction))
    .returns(a.json()),

  updateContentFunction: a
    .mutation()
    .arguments({
      id: a.id().required(),
      title: a.string(),
      description: a.string(),
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
      landscapeImageUrl: a.string(),
      portraitImageUrl: a.string(),
      previewVideoUrl: a.string(),
      fullVideoUrl: a.string(),
      runtime: a.float(),
      resolution: a.string(),
      status: a.boolean(),
      publishDate: a.date(),
      customFields: a.json(),
    })
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(updateContentFunction))
    .returns(a.json()),

  customFields: a
    .model({
      fieldName: a.string().required(),
      order: a.integer(),
    })
    .authorization((allow) => [
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['read', 'create', 'update', 'delete']),
      allow.groups(['SUBSCRIBER']).to(['read']),
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
      allow.groups(['SUBSCRIBER']).to(['create', 'update', 'read']),
      allow.groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR']).to(['read']),
    ]),

  paymentToUser: a
    .model({
      transactionId: a.string().required(),
      userId: a.string().required(),
      subscriptionType: a.string().required(),
      status: a.string(),
      message: a.string(),
    })
    .authorization((allow) => [
      allow.guest().to(['update']),
      allow.groups(['USER']).to(['create']),
      allow.groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR']).to(['read']),
    ]),

  createContentToUserFunction: a
    .mutation()
    .arguments({
      contentId: a.string().required(),
      pauseTime: a.string(),
      isFavorite: a.boolean(),
    })
    .authorization((allow) => [allow.groups(['SUBSCRIBER'])])
    .handler(a.handler.function(createContentToUserFunction))
    .returns(a.json()),

  getContentToUserFunction: a
    .query()
    .arguments({
      contentId: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['SUBSCRIBER'])])
    .handler(a.handler.function(getContentToUserFunction))
    .returns(a.json()),

  getUserFavoritesFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [allow.groups(['SUBSCRIBER'])])
    .handler(a.handler.function(getUserFavoritesFunction))
    .returns(a.json()),

  getContinueWatchFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [allow.groups(['SUBSCRIBER'])])
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
      allow.groups(['SUBSCRIBER']).to(['read']),
      allow
        .groups(['IT_ADMIN', 'SUPER_ADMIN', 'CONTENT_CREATOR'])
        .to(['create', 'read', 'update', 'delete']),
    ]),

  tags: a
    .model({
      tag: a.string(),
      isVisible: a.boolean(),
      selectedContent: a.string(),
      order: a.integer(),
    })
    .authorization((allow) => [
      allow.groups(['SUBSCRIBER']).to(['read']),
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
      allow.groups(['SUBSCRIBER']).to(['read']),
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
      paidUntil: a.string(),
    })
    .authorization((allow) => [allow.groups(['IT_ADMIN', 'SUPER_ADMIN'])])
    .handler(a.handler.function(addUser))
    .returns(a.json()),

  // statistics: a
  //   .query()
  //   .arguments({})
  //   .authorization((allow) => [
  //     allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
  //   ])
  //   .handler(a.handler.function(statistics))
  //   .returns(a.json()),

  // userStatistics: a
  //   .query()
  //   .arguments({})
  //   .authorization((allow) => [
  //     allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
  //   ])
  //   .handler(a.handler.function(userStatistics))
  //   .returns(a.json()),

  // contentStatistics: a
  //   .query()
  //   .arguments({})
  //   .authorization((allow) => [
  //     allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
  //   ])
  //   .handler(a.handler.function(contentStatistics))
  //   .returns(a.json()),

  // User statistics functions
  totalUsersFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(totalUsersFunction))
    .returns(a.json()),

  groupCountsFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(groupCountsFunction))
    .returns(a.json()),

  newRegistrationsFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(newRegistrationsFunction))
    .returns(a.json()),

  // Content statistics functions
  totalContentFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(totalContentFunction))
    .returns(a.json()),

  topViewedContentFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(topViewedContentFunction))
    .returns(a.json()),

  contentByCategoryFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(contentByCategoryFunction))
    .returns(a.json()),

  leastViewedContentFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(leastViewedContentFunction))
    .returns(a.json()),

  averageViewsFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(averageViewsFunction))
    .returns(a.json()),

  recentContentFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(recentContentFunction))
    .returns(a.json()),

  monthlyStatsFunction: a
    .query()
    .arguments({})
    .authorization((allow) => [
      allow.groups(['CONTENT_CREATOR', 'IT_ADMIN', 'SUPER_ADMIN']),
    ])
    .handler(a.handler.function(monthlyStatsFunction))
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

  createPayment: a
    .query()
    .arguments({
      rate: a.string().required(),
      ProcId: a.string().required(),
      email: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['USER'])])
    .handler(a.handler.function(createPaymentFunction))
    .returns(a.json()),

  editUser: a
    .mutation()
    .arguments({
      firstname: a.string().required(),
      lastname: a.string().required(),
      email: a.string().required(),
      birthdate: a.string().required(),
      role: a.string().required(),
      paidUntil: a.string(),
    })
    .authorization((allow) => [allow.groups(['IT_ADMIN', 'SUPER_ADMIN'])])
    .handler(a.handler.function(editUser))
    .returns(a.json()),

  unsubscribeUser: a
    .mutation()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['SUBSCRIBER'])])
    .handler(a.handler.function(unsubscribeUser))
    .returns(a.json()),

  disableUser: a
    .mutation()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['IT_ADMIN', 'SUPER_ADMIN'])])
    .handler(a.handler.function(disableUser))
    .returns(a.json()),

  enableUser: a
    .mutation()
    .arguments({
      email: a.string().required(),
    })
    .authorization((allow) => [allow.groups(['IT_ADMIN', 'SUPER_ADMIN'])])
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
