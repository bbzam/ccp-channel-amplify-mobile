import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { Schema } from '../../resource';
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

type Handler = Schema['listUsers']['functionHandler'];

const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'PAID_SUBSCRIBER',
  'FREE_SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
] as const;

type Role = (typeof ALLOWED_ROLES)[number];
type ExtendedUserType = UserType & { subscriptionType?: string | null };

const SEARCHABLE_ATTRIBUTES = [
  'email',
  'given_name',
  'family_name',
  'custom:role',
];

const mapToActualRole = (role: Role): string => {
  return role === 'PAID_SUBSCRIBER' || role === 'FREE_SUBSCRIBER'
    ? 'SUBSCRIBER'
    : role;
};

let cognitoClient: CognitoIdentityProviderClient;
let ddbClient: DynamoDBDocumentClient;

export const handler: Handler = async (event) => {
  const { role, limit = '60', keyword } = event.arguments;

  if (!role || !ALLOWED_ROLES.includes(role as Role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
    );
  }

  if (!cognitoClient) {
    cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.Region,
    });
  }
  if (!ddbClient) {
    ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  const validLimit = Math.min(Number(limit), 60);
  const isSubscriberRole = mapToActualRole(role as Role) === 'SUBSCRIBER';
  const normalizedKeyword = keyword?.toLowerCase();

  try {
    // Parallel execution
    const cognitoPromise = cognitoClient.send(
      new ListUsersInGroupCommand({
        UserPoolId: process.env.UserPoolId,
        GroupName: mapToActualRole(role as Role),
        Limit: validLimit,
      })
    );

    const promises: Promise<any>[] = [cognitoPromise];
    if (isSubscriberRole) {
      promises.push(
        ddbClient.send(
          new ScanCommand({
            TableName: process.env.PAYMENTTOUSER_TABLE,
            ProjectionExpression: 'userId, subscriptionType, #status',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
          })
        )
      );
    }

    const results = await Promise.all(promises);
    const cognitoResponse = results[0];
    const paymentData = results[1];

    let users = cognitoResponse.Users || [];

    if (normalizedKeyword) {
      users = users.filter(
        (user: UserType) =>
          user.Username?.toLowerCase().includes(normalizedKeyword) ||
          user.Attributes?.some(
            (attr) =>
              SEARCHABLE_ATTRIBUTES.includes(attr.Name || '') &&
              attr.Value?.toLowerCase().includes(normalizedKeyword)
          )
      );
    }

    if (!isSubscriberRole) {
      return { Users: users, NextToken: cognitoResponse.NextToken };
    }

    const subscriptionMap = new Map(
      paymentData?.Items?.map((item: any) => [
        item.userId,
        item.subscriptionType,
      ]) || []
    );

    const paidSubscriberSet = new Set(
      paymentData?.Items?.filter((item: any) => item.status === 'S').map(
        (item: any) => item.userId
      ) || []
    );

    let finalUsers: ExtendedUserType[] = users.map((user: UserType) => ({
      ...user,
      subscriptionType: subscriptionMap.get(user.Username) || null,
    }));

    if (role === 'PAID_SUBSCRIBER') {
      finalUsers = finalUsers.filter((user) =>
        paidSubscriberSet.has(user.Username)
      );
    } else if (role === 'FREE_SUBSCRIBER') {
      finalUsers = finalUsers.filter(
        (user) => !paidSubscriberSet.has(user.Username)
      );
    }

    return { Users: finalUsers, NextToken: cognitoResponse.NextToken };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred');
  }
};
