import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { statistics } from './data/content/statistics/resource';
import { createContentToUserFunction } from './data/content/content-to-user/create-contentToUser/resource';
import { getContentToUserFunction } from './data/content/content-to-user/get-contentToUser/resource';
import { getUserFavoritesFunction } from './data/content/content-to-user/get-userFavorites/resource';
import { getContinueWatchFunction } from './data/content/content-to-user/get-continueWatch/resource';
import { config } from './config';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  statistics,
  createContentToUserFunction,
  getContentToUserFunction,
  getUserFavoritesFunction,
  getContinueWatchFunction,
});

const statisticsQuery = backend.statistics.resources.lambda;
const getcontentToUserQuery = backend.getContentToUserFunction.resources.lambda;
const createContentToUserMutation =
  backend.createContentToUserFunction.resources.lambda;
const getUserFavoritesQuery = backend.getUserFavoritesFunction.resources.lambda;
const getContinueWatchQuery = backend.getContinueWatchFunction.resources.lambda;

const statisticsStatement = new iam.PolicyStatement({
  sid: 'statistics',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENT_TABLE}`,
  ], //limiting the permissions to only Content table
});

const createContentToUserStatement = new iam.PolicyStatement({
  sid: 'createContentToUser',
  actions: ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const getContentToUserStatement = new iam.PolicyStatement({
  sid: 'getContentToUser',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENTTOUSER_TABLE}`,
  ], //limiting the permissions to only ContentToUser table
});

const getUserFavoritesStatement = new iam.PolicyStatement({
  sid: 'getUserFavorites',
  actions: ['dynamodb:Scan', 'dynamodb:BatchGetItem'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENT_TABLE}`,
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

const getContinueWatchStatement = new iam.PolicyStatement({
  sid: 'getContinueWatch',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENTTOUSER_TABLE}`,
  ],
});

statisticsQuery.addToRolePolicy(statisticsStatement);
createContentToUserMutation.addToRolePolicy(createContentToUserStatement);
getcontentToUserQuery.addToRolePolicy(getContentToUserStatement);
getUserFavoritesQuery.addToRolePolicy(getUserFavoritesStatement);
getContinueWatchQuery.addToRolePolicy(getContinueWatchStatement);
