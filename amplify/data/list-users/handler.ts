import type { Schema } from '../resource';
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['listUsers']['functionHandler'];

const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
] as const;

type Role = (typeof ALLOWED_ROLES)[number];

export const handler: Handler = async (event) => {
  try {
    const { role, limit = 60, keyword } = event.arguments;

    // Validate required environment variables
    if (!process.env.Region || !process.env.UserPoolId) {
      throw new Error('Missing required environment variables');
    }

    // Type guard for role
    if (!role || !ALLOWED_ROLES.includes(role as Role)) {
      throw new Error(
        `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
      );
    }

    // Ensure limit is within bounds
    const validLimit = Math.max(1, Math.min(Number(limit), 60));

    const client = new CognitoIdentityProviderClient({
      region: process.env.Region,
    });

    const allUsers: UserType[] = [];
    let nextToken: string | undefined;

    try {
      do {
        const command = new ListUsersInGroupCommand({
          UserPoolId: process.env.UserPoolId,
          GroupName: role,
          Limit: validLimit,
          NextToken: nextToken,
        });

        const response = await client.send(command);

        if (response.Users) {
          allUsers.push(...response.Users);
        }

        nextToken = response.NextToken;
      } while (nextToken);
    } catch (cognitoError) {
      console.error('Cognito API error:', cognitoError);
      throw new Error('Failed to fetch users from Cognito');
    }

    const normalizedKeyword = keyword?.toLowerCase().trim();

    const filteredUsers = !normalizedKeyword
      ? allUsers
      : allUsers.filter((user) =>
          user.Attributes?.some((attr) =>
            attr.Value?.toLowerCase().includes(normalizedKeyword)
          )
        );

    return {
      Users: filteredUsers,
      NextToken: null,
    };
  } catch (error) {
    console.error('Error listing users:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred');
  }
};
