import type { Schema } from '../../resource';
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

type Handler = Schema['resendInvitation']['functionHandler'];
const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event: any) => {
  const userPoolId = process.env.UserPoolId;
  const { email } = event.arguments;

  // Check if the current user has the required role
  const userGroups = event.identity.claims['cognito:groups'] || [];
  if (!userGroups.includes('IT_ADMIN') && !userGroups.includes('SUPER_ADMIN')) {
    throw new Error(
      'Access denied. Only IT_ADMIN and SUPER_ADMIN can resend invitations.'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const tempPassword = generateTemporaryPassword();
  const command = new AdminCreateUserCommand({
    Username: email,
    UserPoolId: userPoolId,
    MessageAction: 'RESEND',
    TemporaryPassword: tempPassword,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
};

function generateTemporaryPassword(length: number = 12): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }

  password = password + '8#Cp_';
  console.log('password generated', password);
  return password;
}
