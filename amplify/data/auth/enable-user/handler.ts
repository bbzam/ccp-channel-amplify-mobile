import type { Schema } from '../../resource';
import {
  AdminEnableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['enableUser']['functionHandler'];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  try {
    const userPoolId = process.env.UserPoolId;
    const body = event.arguments;
    const command = new AdminEnableUserCommand({
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
