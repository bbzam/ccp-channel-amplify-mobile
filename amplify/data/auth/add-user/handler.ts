import type { Schema } from '../../resource';
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
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
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);
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

  // Validate paidUntil required field in role SUBSCRIBER
  if (['SUBSCRIBER'].includes(body.role) && !body.paidUntil) {
    throw new Error(
      'Failed adding Subscriber. Missing required field: Paid until is required'
    );
  }

  function formatDateForCognito(dateValue: string): string {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format for paidUntil');
    }

    return date.toISOString().split('T')[0]; // Returns yyyy-MM-dd format
  }

  const userAttributes = [
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
  ];

  // Only add paidUntil if it exists and format it properly
  if (body.paidUntil) {
    userAttributes.push({
      Name: 'custom:paidUntil',
      Value: formatDateForCognito(body.paidUntil),
    });
  }

  const tempPassword = generateTemporaryPassword();
  const command = new AdminCreateUserCommand({
    Username: event.arguments.email,
    UserPoolId: userPoolId,
    UserAttributes: userAttributes,
    TemporaryPassword: tempPassword,
    ForceAliasCreation: false,
    DesiredDeliveryMediums: ['EMAIL'],
  });
  try {
    const response = await client.send(command);

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.COUNTER_TABLE,
        Key: { counterName: 'totalAllUsers' },
        UpdateExpression:
          'SET #counter = if_not_exists(#counter, :zero) + :inc',
        ExpressionAttributeNames: {
          '#counter': 'counter',
        },
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
        },
        ReturnValues: 'UPDATED_NEW',
      })
    );

    // You'll need to use AWS SDK to add the user to the group
    const groupCommand = new AdminAddUserToGroupCommand({
      GroupName: body.role,
      Username: body.email,
      UserPoolId: userPoolId,
    });

    console.log(groupCommand);

    await client.send(groupCommand);

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.COUNTER_TABLE,
        Key: { counterName: `total${body.role}s` },
        UpdateExpression:
          'SET #counter = if_not_exists(#counter, :zero) + :inc',
        ExpressionAttributeNames: {
          '#counter': 'counter',
        },
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
        },
        ReturnValues: 'UPDATED_NEW',
      })
    );

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
