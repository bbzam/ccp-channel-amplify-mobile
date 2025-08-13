import type { Schema } from '../../resource';
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

type Handler = Schema['addUser']['functionHandler'];
const client = new CognitoIdentityProviderClient();

const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
];

export const handler: Handler = async (event: any) => {
  const userPoolId = process.env.UserPoolId;
  console.log(userPoolId);

  const body = event.arguments;

  // Check if the current user has the required role
  const userGroups = event.identity.claims['cognito:groups'] || [];
  if (!userGroups.includes('IT_ADMIN') && !userGroups.includes('SUPER_ADMIN')) {
    throw new Error(
      'Access denied. Only IT_ADMIN and SUPER_ADMIN can add users.'
    );
  }

  // Role assignment restrictions based on admin type
  const isItAdmin =
    userGroups.includes('IT_ADMIN') && !userGroups.includes('SUPER_ADMIN');
  if (isItAdmin && !['USER', 'CONTENT_CREATOR'].includes(body.role)) {
    throw new Error('IT_ADMIN can only assign USER and CONTENT_CREATOR roles');
  }

  // Validate role
  if (!body.role || !ALLOWED_ROLES.includes(body.role)) {
    throw new Error(
      `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}`
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    throw new Error('Invalid email format');
  }

  // Validate required fields
  if (!body.firstname || !body.lastname || !body.birthdate) {
    throw new Error(
      'Missing required fields: firstname, lastname, and birthdate are required'
    );
  }
  const tempPassword = generateTemporaryPassword();
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
        Name: 'email_verified',
        Value: 'true',
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
    TemporaryPassword: tempPassword,
    ForceAliasCreation: false,
    DesiredDeliveryMediums: ['EMAIL'],
  });
  try {
    const response = await client.send(command);

    // You'll need to use AWS SDK to add the user to the group
    const groupCommand = new AdminAddUserToGroupCommand({
      GroupName: body.role,
      Username: body.email,
      UserPoolId: userPoolId,
    });

    console.log(groupCommand);

    await client.send(groupCommand);

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
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
