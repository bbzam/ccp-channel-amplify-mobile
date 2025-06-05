import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { incrementViewcount } from './data/increment-viewcount/resource';
import { statistics } from './data/statistics/resource';
import { config } from './config';
import * as iam from 'aws-cdk-lib/aws-iam';

const backend = defineBackend({
  auth,
  data,
  storage,
  incrementViewcount,
  statistics,
});

const incrementViewCountMutation = backend.incrementViewcount.resources.lambda;
const statisticsQuery = backend.statistics.resources.lambda;

const incrementViewCount = new iam.PolicyStatement({
  sid: 'IncrementViewCount',
  actions: ['dynamodb:UpdateItem'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENT_TABLE}`,
  ], //limiting the permissions to only Content tables
});

const statisticsStatement = new iam.PolicyStatement({
  sid: 'statistics',
  actions: ['dynamodb:Scan'],
  resources: [
    `arn:aws:dynamodb:ap-southeast-1:879639852836:table/${config.CONTENT_TABLE}`,
  ], //limiting the permissions to only Content tables
});

incrementViewCountMutation.addToRolePolicy(incrementViewCount);
statisticsQuery.addToRolePolicy(statisticsStatement);
