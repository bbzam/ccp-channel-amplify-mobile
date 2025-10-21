import { Handler } from 'aws-lambda';
import {
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new CognitoIdentityProviderClient();

export const handler: Handler = async (event) => {
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);
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
    hasSubscriber:
      userGroups.includes('SUBSCRIBER') ||
      userGroups.includes('FREE_SUBSCRIBER'),
  });

  if (
    !userGroups.includes('SUBSCRIBER') ||
    !userGroups.includes('FREE_SUBSCRIBER')
  ) {
    console.error('Access denied - not SUBSCRIBER');
    throw new Error(
      'Access denied. Only SUBSCRIBER can change their role to USER for Unsubscribing.'
    );
  }

  try {
    let currentRole = userGroups.includes('SUBSCRIBER')
      ? 'SUBSCRIBER'
      : 'FREE_SUBSCRIBER';

    console.log('Updating user role', { from: currentRole, to: 'USER' });

    const removeGroupCommand = new AdminRemoveUserFromGroupCommand({
      GroupName: currentRole,
      Username: email,
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
      GroupName: 'USER',
      Username: email,
      UserPoolId: userPoolId,
    });
    await client.send(addGroupCommand);

    await docClient.send(
      new UpdateCommand({
        TableName: process.env.COUNTER_TABLE,
        Key: { counterName: 'totalUSERs' },
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

    console.log('Role updated successfully');
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};
