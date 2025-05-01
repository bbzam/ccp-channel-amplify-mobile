import type { Schema } from '../resource';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersInGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['listUsers']['functionHandler'];
const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
];

export const handler: Handler = async (event) => {
  try {
    const body = event.arguments;

    // Validate role
    if (!body.role || !ALLOWED_ROLES.includes(body.role)) {
      throw new Error(
        `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
      );
    }

    const client = new CognitoIdentityProviderClient({
      region: process.env.Region, // Get region from environment variable
    });

    const command = new ListUsersInGroupCommand({
      UserPoolId: process.env.UserPoolId, // Get User Pool ID from environment variable
      GroupName: body.role,
      Limit: Number(body.limit),
    });

    const response = await client.send(command);

    const keyword = body.keyword?.toLowerCase();

    const filteredUsers = !keyword
      ? response.Users
      : response.Users?.filter((user) =>
          user.Attributes?.some((attr) =>
            attr.Value?.toLowerCase().includes(keyword)
          )
        );

    response.Users = filteredUsers;

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
