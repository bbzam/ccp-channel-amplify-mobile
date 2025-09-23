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
    // Get all users with pagination
    let allUsers: UserType[] = [];
    let nextToken: string | undefined;

    do {
      const response = await cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: process.env.UserPoolId,
          GroupName: mapToActualRole(role as Role),
          Limit: 60,
          NextToken: nextToken,
        })
      );

      allUsers = allUsers.concat(response.Users || []);
      nextToken = response.NextToken;
    } while (nextToken);

    const promises: Promise<any>[] = [];
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
    const paymentData = results[0];

    let users = allUsers;

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
      return { Users: users };
    }

    const subscriptionMap = new Map();
    const paidSubscriberSet = new Set();

    if (paymentData?.Items) {
      paymentData.Items.forEach((item: any) => {
        if (item.userId && item.subscriptionType) {
          subscriptionMap.set(item.userId, item.subscriptionType);
        }
        if (item.userId && item.status === 'S') {
          paidSubscriberSet.add(item.userId);
        }
      });
    }

    // Replace the user matching logic (lines 108-130) with:
    let finalUsers: ExtendedUserType[] = users.map((user: UserType) => {
      const userEmail = user.Attributes?.find(
        (attr) => attr.Name === 'email'
      )?.Value;
      const userId = user.Username;

      return {
        ...user,
        subscriptionType:
          subscriptionMap.get(userId) || subscriptionMap.get(userEmail) || null,
      };
    });

    if (role === 'PAID_SUBSCRIBER') {
      finalUsers = finalUsers.filter((user) => {
        const userEmail = user.Attributes?.find(
          (attr) => attr.Name === 'email'
        )?.Value;
        return (
          paidSubscriberSet.has(user.Username) ||
          paidSubscriberSet.has(userEmail)
        );
      });
    } else if (role === 'FREE_SUBSCRIBER') {
      finalUsers = finalUsers.filter((user) => {
        const userEmail = user.Attributes?.find(
          (attr) => attr.Name === 'email'
        )?.Value;
        return (
          !paidSubscriberSet.has(user.Username) &&
          !paidSubscriberSet.has(userEmail)
        );
      });
    }

    return { Users: finalUsers };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred');
  }
};
