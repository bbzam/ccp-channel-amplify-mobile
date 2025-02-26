import type { Schema } from '../resource';
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

type Handler = Schema['addUser']['functionHandler'];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const userPoolId = process.env.UserPoolId;
  const body = event.arguments;
  const command = new AdminCreateUserCommand({
    Username: event.arguments.email,
    UserPoolId: userPoolId,
    UserAttributes: [
      {
        Name: 'given_name',
        Value: body.firstname,
      },
      {
        Name: 'family_name',
        Value: body.lastname,
      },
      {
        Name: 'email',
        Value: body.email,
      },
      {
        Name: 'birthdate',
        Value: body.birthdate,
      },
    ],
    TemporaryPassword: generateTemporaryPassword(),
    ForceAliasCreation: false,
    DesiredDeliveryMediums: ['EMAIL'],
    ClientMetadata: {
      '<keys>': 'STRING_VALUE',
    },
  });
  const response = await client.send(command);
  return response;
};

function generateTemporaryPassword(length: number = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Create a more secure random number generator
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  password = password + '8#Cp_';

  console.log('password generated', password);

  return password;
}
