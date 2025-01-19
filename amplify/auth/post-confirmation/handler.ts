import { PostConfirmationTriggerEvent } from 'aws-lambda';
import {
    CognitoIdentityProviderClient,
    AdminAddUserToGroupCommand
  } from '@aws-sdk/client-cognito-identity-provider';
  
export const handler = async (event: PostConfirmationTriggerEvent) => {
  try {
    // Get the user attributes from the event
    const { userPoolId, userName } = event;
    const groupName = process.env.GROUP_NAME;

    // Add user to group using AWS SDK v3
    const params = {
      GroupName: groupName,
      UserPoolId: userPoolId,
      Username: userName
    };

    const client = new CognitoIdentityProviderClient();

    // You'll need to use AWS SDK to add the user to the group
   const command = new AdminAddUserToGroupCommand({
          GroupName: params.GroupName,
          Username: params.Username,
          UserPoolId: event.userPoolId
    });
    const response = await client.send(command);

    console.log(`User ${userName} has been added to group ${groupName}`);

    // Return the event object back to Amazon Cognito
    return event;
  } catch (error) {
    console.error('Error in post confirmation:', error);
    throw error;
  }
};