import type { Schema } from '../../resource';
import {
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

type Handler = Schema['editUser']['functionHandler'];
const client = new CognitoIdentityProviderClient();

const ALLOWED_ROLES = [
  'USER',
  'SUBSCRIBER',
  'CONTENT_CREATOR',
  'IT_ADMIN',
  'SUPER_ADMIN',
];

export const handler: Handler = async (event) => {
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);
  const userPoolId = process.env.UserPoolId;
  console.log(userPoolId);

  const body = event.arguments;

  const userGroups =
    event.identity && 'claims' in event.identity
      ? (event.identity.claims['cognito:groups'] as string[]) || []
      : [];

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

  const command = new AdminUpdateUserAttributesCommand({
    Username: body.email,
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
        Name: 'birthdate',
        Value: body.birthdate,
      },
      {
        Name: 'custom:paidUntil',
        Value: body.paidUntil || '',
      },
    ],
  });
  try {
    const response = await client.send(command);
    let currentRole = '';

    const getGroupCommand = new AdminListGroupsForUserCommand({
      Username: body.email,
      UserPoolId: userPoolId,
    });
    const groupResponse = await client.send(getGroupCommand);
    const existingGroups = groupResponse.Groups || [];

    // Check if user's current group matches the requested role
    const hasMatchingRole = existingGroups.some((group) => {
      currentRole = group.GroupName || '';
      group.GroupName === body.role;
    });

    if (!hasMatchingRole) {
      const removeGroupCommand = new AdminRemoveUserFromGroupCommand({
        GroupName: currentRole,
        Username: body.email,
        UserPoolId: userPoolId,
      });
      await client.send(removeGroupCommand);

      await docClient.send(
        new UpdateCommand({
          TableName: process.env.COUNTER_TABLE,
          Key: { counterName: `total${currentRole}s` },
          UpdateExpression:
            'SET #counter = if_not_exists(#counter, :zero) - :inc',
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

      const addGroupCommand = new AdminAddUserToGroupCommand({
        GroupName: body.role,
        Username: body.email,
        UserPoolId: userPoolId,
      });
      await client.send(addGroupCommand);

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
    }

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
