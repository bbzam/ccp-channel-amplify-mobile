import type { Schema } from '../../resource';
import {
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

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
  const userPoolId = process.env.UserPoolId;
  console.log(userPoolId);

  const body = event.arguments;

  // Check if the current user has the required role
  const userGroups =
    event.identity && 'claims' in event.identity
      ? (event.identity.claims['cognito:groups'] as string[]) || []
      : [];

  if (!userGroups.includes('IT_ADMIN') && !userGroups.includes('SUPER_ADMIN')) {
    throw new Error(
      'Access denied. Only IT_ADMIN and SUPER_ADMIN can edit users.'
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

      const addGroupCommand = new AdminAddUserToGroupCommand({
        GroupName: body.role,
        Username: body.email,
        UserPoolId: userPoolId,
      });
      await client.send(addGroupCommand);
    }

    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
