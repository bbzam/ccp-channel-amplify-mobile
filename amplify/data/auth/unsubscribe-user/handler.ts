import { Handler } from 'aws-lambda';
import {
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const userPoolId = process.env.UserPoolId;
  const email = event.arguments.email;
  console.log('event', event);

  console.log('Unsubscribe handler started', { email: email });

  // Check if the current user has the required role
  const userGroups =
    event.identity && 'claims' in event.identity
      ? (event.identity.claims['cognito:groups'] as string[]) || []
      : [];

  console.log('User groups check', {
    userGroups,
    hasSubscriber: userGroups.includes('SUBSCRIBER'),
  });

  if (!userGroups.includes('SUBSCRIBER')) {
    console.error('Access denied - not SUBSCRIBER');
    throw new Error(
      'Access denied. Only SUBSCRIBER can change their role to USER for Unsubscribing.'
    );
  }

  try {
    let currentRole = 'SUBSCRIBER';

    console.log('Updating user role', { from: currentRole, to: 'USER' });

    const removeGroupCommand = new AdminRemoveUserFromGroupCommand({
      GroupName: currentRole,
      Username: email,
      UserPoolId: userPoolId,
    });
    await client.send(removeGroupCommand);

    const addGroupCommand = new AdminAddUserToGroupCommand({
      GroupName: 'USER',
      Username: email,
      UserPoolId: userPoolId,
    });
    await client.send(addGroupCommand);

    console.log('Role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
