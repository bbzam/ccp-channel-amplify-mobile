import type { Schema } from '../resource';
import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

type Handler = Schema['listUser']['functionHandler'];

export const handler: Handler = async (event) => {
  try {
    const body = event.arguments;

    // Validate that email is provided
    if (!body.email) {
      throw new Error('Email is required to get user details');
    }

    const client = new CognitoIdentityProviderClient({
      region: process.env.Region,
    });

    const command = new AdminGetUserCommand({
      UserPoolId: process.env.UserPoolId,
      Username: body.email,
    });

    const response = await client.send(command);

    // Return the response in a consistent format
    return JSON.stringify(response);
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};
