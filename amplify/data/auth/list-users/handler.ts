import type { Schema } from '../../resource';
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['listUsers']['functionHandler'];

const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'FREE_SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
] as const;

type Role = (typeof ALLOWED_ROLES)[number];

const SEARCHABLE_ATTRIBUTES = [
  'email',
  'given_name',
  'family_name',
  'custom:role',
];

let cognitoClient: CognitoIdentityProviderClient;

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

  const normalizedKeyword = keyword?.toLowerCase();

  try {
    // Get all users with pagination
    let allUsers: UserType[] = [];
    let nextToken: string | undefined;

    do {
      const response = await cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: process.env.UserPoolId,
          GroupName: role as Role,
          Limit: 60,
          NextToken: nextToken,
        })
      );

      allUsers = allUsers.concat(response.Users || []);
      nextToken = response.NextToken;
    } while (nextToken);

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

    return { Users: users };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred');
  }
};
