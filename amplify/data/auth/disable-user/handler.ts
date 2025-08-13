import type { Schema } from '../../resource';
import {
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['disableUser']['functionHandler'];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  try {
    const userPoolId = process.env.UserPoolId;
    const body = event.arguments;

    // Check if the current user has the required role
    const userGroups =
      event.identity && 'claims' in event.identity
        ? (event.identity.claims['cognito:groups'] as string[]) || []
        : [];

    if (
      !userGroups.includes('IT_ADMIN') &&
      !userGroups.includes('SUPER_ADMIN')
    ) {
      throw new Error(
        'Access denied. Only IT_ADMIN and SUPER_ADMIN can disable users.'
      );
    }

    const command = new AdminDisableUserCommand({
      Username: body.email,
      UserPoolId: userPoolId,
    });
    const response = await client.send(command);

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
