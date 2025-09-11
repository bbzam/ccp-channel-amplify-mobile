import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
// import { statistics } from './data/content/statistics/resource';
// import { userStatistics } from './data/content/statistics/user-statistics/resource';
// import { contentStatistics } from './data/content/statistics/content-statistics/resource';
import { createContentToUserFunction } from './data/content/content-to-user/create-contentToUser/resource';
import { getContentToUserFunction } from './data/content/content-to-user/get-contentToUser/resource';
import { getUserFavoritesFunction } from './data/content/content-to-user/get-userFavorites/resource';
import { getContinueWatchFunction } from './data/content/content-to-user/get-continueWatch/resource';
import { createContentFunction } from './data/content/content/create-content/resource';
import { updateContentFunction } from './data/content/content/update-content/resource';
import { getContentFunction } from './data/content/content/get-content/resource';
import { onImageUpload } from './storage/onUpload/onImageUpload/resource';
import { onPreviewVideoUpload } from './storage/onUpload/onPreviewVideoUpload/resource';
import { onFullVideoUpload } from './storage/onUpload/onFullVideoUpload/resource';
import { createVttFunction } from './storage/create-vtt/resource';
import { afterMediaConvertFunction } from './storage/after-mediaConvert/resource';
import { createPaymentFunction } from './data/payment/create-payment/resource';
import { listUsers } from './data/auth/list-users/resource';
import { groupCountsFunction } from './data/content/statistics/user-statistics/group-counts/resource';
import { totalUsersFunction } from './data/content/statistics/user-statistics/total-users/resource';
import { newRegistrationsFunction } from './data/content/statistics/user-statistics/new-registrations/resource';
import { totalContentFunction } from './data/content/statistics/content-statistics/total-content/resource';
import { topViewedContentFunction } from './data/content/statistics/content-statistics/top-viewed-content/resource';
import { contentByCategoryFunction } from './data/content/statistics/content-statistics/content-by-category/resource';
import { leastViewedContentFunction } from './data/content/statistics/content-statistics/least-viewed-content/resource';
import { averageViewsFunction } from './data/content/statistics/content-statistics/average-views/resource';
import { recentContentFunction } from './data/content/statistics/content-statistics/recent-content/resource';
import { monthlyStatsFunction } from './data/content/statistics/content-statistics/monthly-stats/resource';
import { config } from './config';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';

const backend = defineBackend({
  auth,
  data,
  storage,
  // contentStatistics,
  // userStatistics,
  createContentToUserFunction,
  getContentToUserFunction,
  getUserFavoritesFunction,
  getContinueWatchFunction,
  createContentFunction,
  updateContentFunction,
  getContentFunction,
  onImageUpload,
  onPreviewVideoUpload,
  onFullVideoUpload,
  createVttFunction,
  afterMediaConvertFunction,
  createPaymentFunction,
  listUsers,
  groupCountsFunction,
  totalUsersFunction,
  newRegistrationsFunction,
  totalContentFunction,
  topViewedContentFunction,
  contentByCategoryFunction,
  leastViewedContentFunction,
  averageViewsFunction,
  recentContentFunction,
  monthlyStatsFunction,
});

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.onImageUpload.resources.lambda),
  { prefix: 'landscape-images/' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.onImageUpload.resources.lambda),
  { prefix: 'portrait-images/' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.onPreviewVideoUpload.resources.lambda),
  { prefix: 'preview-videos/' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.onFullVideoUpload.resources.lambda),
  { prefix: 'full-videos/' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.createVttFunction.resources.lambda),
  { prefix: 'processed-full-videos/', suffix: '.folder' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.afterMediaConvertFunction.resources.lambda),
  { prefix: 'processed-full-videos/', suffix: '.mpd' }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED_PUT,
  new LambdaDestination(backend.afterMediaConvertFunction.resources.lambda),
  { prefix: 'processed-full-videos/', suffix: '.m3u8' }
);

const createVtt = backend.createVttFunction.resources.lambda;
// const statisticsQuery = backend.statistics.resources.lambda;
// const contentStatisticsQuery = backend.contentStatistics.resources.lambda;
// const userStatisticsQuery = backend.userStatistics.resources.lambda;
const totalContentQuery = backend.totalContentFunction.resources.lambda;
const topViewedContentQuery = backend.topViewedContentFunction.resources.lambda;
const contentByCategoryQuery =
  backend.contentByCategoryFunction.resources.lambda;
const leastViewedContentQuery =
  backend.leastViewedContentFunction.resources.lambda;
const averageViewsQuery = backend.averageViewsFunction.resources.lambda;
const recentContentQuery = backend.recentContentFunction.resources.lambda;
const monthlyStatsQuery = backend.monthlyStatsFunction.resources.lambda;
const groupCountsQuery = backend.groupCountsFunction.resources.lambda;
const totalUsersQuery = backend.totalUsersFunction.resources.lambda;
const newRegistrationsQuery = backend.newRegistrationsFunction.resources.lambda;
const getcontentToUserQuery = backend.getContentToUserFunction.resources.lambda;
const createContentToUserMutation =
  backend.createContentToUserFunction.resources.lambda;
const getUserFavoritesQuery = backend.getUserFavoritesFunction.resources.lambda;
const getContinueWatchQuery = backend.getContinueWatchFunction.resources.lambda;
const getContentQuery = backend.getContentFunction.resources.lambda;
const createContentMutation = backend.createContentFunction.resources.lambda;
const updateContentMutation = backend.updateContentFunction.resources.lambda;
const afterMediaConvert = backend.afterMediaConvertFunction.resources.lambda;
const createPaymentQuery = backend.createPaymentFunction.resources.lambda;
const listUsersQuery = backend.listUsers.resources.lambda;

const createVttStatement = new iam.PolicyStatement({
  sid: 'createVtt',
  actions: ['dynamodb:UpdateItem', 's3:PutObject', 's3:GetObject'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:s3:::${config.BUCKET_NAME}/*`,
  ],
});

const getContentStatement = new iam.PolicyStatement({
  sid: 'getAllContents',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const createContentStatement = new iam.PolicyStatement({
  sid: 'createContent',
  actions: [
    'dynamodb:PutItem',
    'dynamodb:UpdateItem',
    'dynamodb:Scan',
    's3:PutObject',
    'mediaconvert:DescribeEndpoints',
    'iam:PassRole',
    'mediaconvert:CreateJob',
  ],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CUSTOMFIELDS_TABLE}`,
    `arn:aws:s3:::${config.BUCKET_NAME}/*`,
    `arn:aws:mediaconvert:${config.REGION}:${config.ACCOUNT_ID}:endpoints/*`,
    `arn:aws:iam::${config.ACCOUNT_ID}:${config.MEDIACONVERT_ROLE}`,
    `arn:aws:mediaconvert:${config.REGION}:${config.ACCOUNT_ID}:queues/Default`,
  ],
});

const updateContentStatement = new iam.PolicyStatement({
  sid: 'updateContent',
  actions: ['dynamodb:UpdateItem', 'dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CUSTOMFIELDS_TABLE}`,
  ],
});

// const statisticsStatement = new iam.PolicyStatement({
//   sid: 'statistics',
//   actions: ['dynamodb:Scan'],
//   resources: [
//     `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
//   ], //limiting the permissions to only Content table
// });

// const contentStatisticsStatement = new iam.PolicyStatement({
//   sid: 'contentStatistics',
//   actions: ['dynamodb:Scan'],
//   resources: [
//     `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
//   ],
// });

// const userStatisticsStatement = new iam.PolicyStatement({
//   sid: 'userStatistics',
//   actions: ['cognito-idp:ListUsersInGroup', 'dynamodb:Scan'],
//   resources: [
//     `arn:aws:cognito-idp:${config.REGION}:${config.ACCOUNT_ID}:userpool/${config.USER_POOL_ID}`,
//     `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.PAYMENTTOUSER_TABLE}`,
//   ],
// });

const contentStatsStatement = new iam.PolicyStatement({
  sid: 'contentStats',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
  ],
});

const groupCountsStatement = new iam.PolicyStatement({
  sid: 'groupCounts',
  actions: ['cognito-idp:ListUsersInGroup', 'dynamodb:Scan'],
  resources: [
    `arn:aws:cognito-idp:${config.REGION}:${config.ACCOUNT_ID}:userpool/${config.USER_POOL_ID}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.PAYMENTTOUSER_TABLE}`,
  ],
});

const totalUsersStatement = new iam.PolicyStatement({
  sid: 'totalUsers',
  actions: ['cognito-idp:ListUsersInGroup'],
  resources: [
    `arn:aws:cognito-idp:${config.REGION}:${config.ACCOUNT_ID}:userpool/${config.USER_POOL_ID}`,
  ],
});

const newRegistrationsStatement = new iam.PolicyStatement({
  sid: 'newRegistrations',
  actions: ['cognito-idp:ListUsersInGroup'],
  resources: [
    `arn:aws:cognito-idp:${config.REGION}:${config.ACCOUNT_ID}:userpool/${config.USER_POOL_ID}`,
  ],
});

const createContentToUserStatement = new iam.PolicyStatement({
  sid: 'createContentToUser',
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const getContentToUserStatement = new iam.PolicyStatement({
  sid: 'getContentToUser',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENTTOUSER_TABLE}`,
  ], //limiting the permissions to only ContentToUser table
});

const getUserFavoritesStatement = new iam.PolicyStatement({
  sid: 'getUserFavorites',
  actions: ['dynamodb:Scan', 'dynamodb:BatchGetItem'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const getContinueWatchStatement = new iam.PolicyStatement({
  sid: 'getContinueWatch',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const afterMediaConvertStatement = new iam.PolicyStatement({
  sid: 'afterMediaConvert',
  actions: ['dynamodb:Scan', 'dynamodb:UpdateItem'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.CONTENT_TABLE}`,
  ],
});

const createPaymentStatement = new iam.PolicyStatement({
  sid: 'createPayment',
  actions: ['dynamodb:PutItem'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.PAYMENTTOUSER_TABLE}`,
  ],
});

const listUsersStatement = new iam.PolicyStatement({
  sid: 'listUsersDynamoDB',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:${config.REGION}:${config.ACCOUNT_ID}:table/${config.PAYMENTTOUSER_TABLE}`,
  ],
});

createVtt.addToRolePolicy(createVttStatement);
getContentQuery.addToRolePolicy(getContentStatement);
createContentMutation.addToRolePolicy(createContentStatement);
updateContentMutation.addToRolePolicy(updateContentStatement);
// statisticsQuery.addToRolePolicy(statisticsStatement);
// contentStatisticsQuery.addToRolePolicy(contentStatisticsStatement);
// userStatisticsQuery.addToRolePolicy(userStatisticsStatement);
totalContentQuery.addToRolePolicy(contentStatsStatement);
topViewedContentQuery.addToRolePolicy(contentStatsStatement);
contentByCategoryQuery.addToRolePolicy(contentStatsStatement);
leastViewedContentQuery.addToRolePolicy(contentStatsStatement);
averageViewsQuery.addToRolePolicy(contentStatsStatement);
recentContentQuery.addToRolePolicy(contentStatsStatement);
monthlyStatsQuery.addToRolePolicy(contentStatsStatement);
groupCountsQuery.addToRolePolicy(groupCountsStatement);
totalUsersQuery.addToRolePolicy(totalUsersStatement);
newRegistrationsQuery.addToRolePolicy(newRegistrationsStatement);
createContentToUserMutation.addToRolePolicy(createContentToUserStatement);
getcontentToUserQuery.addToRolePolicy(getContentToUserStatement);
getUserFavoritesQuery.addToRolePolicy(getUserFavoritesStatement);
getContinueWatchQuery.addToRolePolicy(getContinueWatchStatement);
afterMediaConvert.addToRolePolicy(afterMediaConvertStatement);
createPaymentQuery.addToRolePolicy(createPaymentStatement);
listUsersQuery.addToRolePolicy(listUsersStatement);
