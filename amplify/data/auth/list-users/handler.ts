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

// Reuse clients across invocations
let cognitoClient: CognitoIdentityProviderClient;
let ddbClient: DynamoDBDocumentClient;

export const handler: Handler = async (event) => {
  const { role, limit = '60', keyword } = event.arguments;

  if (!role || !ALLOWED_ROLES.includes(role as Role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
    );
  }

  // Initialize clients once
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
    // Single Cognito call
    const cognitoPromise = cognitoClient.send(
      new ListUsersInGroupCommand({
        UserPoolId: process.env.UserPoolId,
        GroupName: mapToActualRole(role as Role),
        Limit: validLimit,
      })
    );

    // Conditional DynamoDB call - only for subscribers
    const promises: Promise<any>[] = [cognitoPromise];
    if (isSubscriberRole) {
      promises.push(
        ddbClient.send(
          new ScanCommand({
            TableName: process.env.PAYMENTTOUSER_TABLE,
            ProjectionExpression: 'userId, subscriptionType, status',
            FilterExpression: 'attribute_exists(subscriptionType)',
          })
        )
      );
    }

    const results = await Promise.all(promises);
    const cognitoResponse = results[0];
    const paymentData = results[1];

    let users = cognitoResponse.Users || [];

    // Fast keyword filtering first
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

    // Early return for non-subscribers
    if (!isSubscriberRole) {
      return { Users: users, NextToken: cognitoResponse.NextToken };
    }

    // Fast subscription processing
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

    // Apply subscription filter
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

// import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
// import type { Schema } from '../../resource';
// import {
//   CognitoIdentityProviderClient,
//   ListUsersInGroupCommand,
//   UserType,
// } from '@aws-sdk/client-cognito-identity-provider';
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

// type Handler = Schema['listUsers']['functionHandler'];

// const ALLOWED_ROLES = [
//   'USER',
//   'SUBSCRIBER',
//   'PAID_SUBSCRIBER',
//   'FREE_SUBSCRIBER',
//   'CONTENT_CREATOR',
//   'IT_ADMIN',
//   'SUPER_ADMIN',
// ] as const;

// type Role = (typeof ALLOWED_ROLES)[number];
// type ExtendedUserType = UserType & { subscriptionType?: string | null };

// const SEARCHABLE_ATTRIBUTES = [
//   'email',
//   'given_name',
//   'family_name',
//   'custom:role',
// ];

// const mapToActualRole = (role: Role): string => {
//   return role === 'PAID_SUBSCRIBER' || role === 'FREE_SUBSCRIBER'
//     ? 'SUBSCRIBER'
//     : role;
// };

// export const handler: Handler = async (event) => {
//   try {
//     const ddbClient = new DynamoDBClient({});
//     const docClient = DynamoDBDocumentClient.from(ddbClient);
//     const { role, limit = 60, keyword } = event.arguments;

//     if (!process.env.Region || !process.env.UserPoolId) {
//       throw new Error('Missing required environment variables');
//     }

//     if (!role || !ALLOWED_ROLES.includes(role as Role)) {
//       throw new Error(
//         `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
//       );
//     }

//     const validLimit = Math.max(1, Math.min(Number(limit), 60));

//     // Start payment data fetch early
//     const paymentPromise = docClient.send(
//       new ScanCommand({
//         TableName: process.env.PAYMENTTOUSER_TABLE,
//       })
//     );

//     const client = new CognitoIdentityProviderClient({
//       region: process.env.Region,
//     });

//     // Fetch users with controlled pagination
//     const allUsers: UserType[] = [];
//     let nextToken: string | undefined;
//     let pageCount = 0;
//     const maxPages = 10; // Prevent infinite loops

//     try {
//       do {
//         const command = new ListUsersInGroupCommand({
//           UserPoolId: process.env.UserPoolId,
//           GroupName: mapToActualRole(role as Role),
//           Limit: validLimit,
//           NextToken: nextToken,
//         });

//         const response = await client.send(command);

//         if (response.Users) {
//           allUsers.push(...response.Users);
//         }

//         nextToken = response.NextToken;
//         pageCount++;
//       } while (nextToken && pageCount < maxPages);
//     } catch (cognitoError) {
//       console.error('Cognito API error:', cognitoError);
//       throw cognitoError;
//     }

//     // Filter by keyword
//     const normalizedKeyword = keyword?.toLowerCase().trim();
//     const filteredUsers = !normalizedKeyword
//       ? allUsers
//       : allUsers.filter((user) => {
//           if (user.Username?.toLowerCase().includes(normalizedKeyword)) {
//             return true;
//           }
//           return user.Attributes?.some(
//             (attr) =>
//               SEARCHABLE_ATTRIBUTES.includes(attr.Name || '') &&
//               attr.Value?.toLowerCase().includes(normalizedKeyword)
//           );
//         });

//     console.info(
//       `Total users: ${allUsers.length}, Filtered users: ${filteredUsers.length}, Pages: ${pageCount}`
//     );

//     let finalUsers: ExtendedUserType[] =
//       mapToActualRole(role as Role) !== 'SUBSCRIBER' ? filteredUsers : [];

//     // Get subscription data
//     if (mapToActualRole(role as Role) === 'SUBSCRIBER') {
//       const { Items: paymentData } = await paymentPromise;
//       const subscriptionMap = new Map(
//         paymentData?.map((item) => [item.userId, item.subscriptionType])
//       );

//       finalUsers = filteredUsers.map((user) => ({
//         ...user,
//         subscriptionType: subscriptionMap.get(user.Username) || null,
//       }));

//       // Filter by subscription type
//       if (role === 'PAID_SUBSCRIBER') {
//         finalUsers = finalUsers.filter((user) => user.subscriptionType);
//       } else if (role === 'FREE_SUBSCRIBER') {
//         finalUsers = finalUsers.filter((user) => !user.subscriptionType);
//       }
//     }

//     return {
//       Users: finalUsers,
//       NextToken: pageCount >= maxPages ? nextToken : null,
//     };
//   } catch (error) {
//     console.error('Error listing users:', error);
//     throw error instanceof Error
//       ? error
//       : new Error('An unexpected error occurred');
//   }
// };
