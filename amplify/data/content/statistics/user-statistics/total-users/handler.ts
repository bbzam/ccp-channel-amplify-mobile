import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  ListUsersInGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

export const handler = async () => {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });

  try {
    const groups = ['USER', 'SUBSCRIBER'];
    const allUsers = new Set();

    for (const groupName of groups) {
      let nextToken;
      do {
        const response: ListUsersInGroupCommandOutput =
          await cognitoClient.send(
            new ListUsersInGroupCommand({
              UserPoolId: process.env.USER_POOL_ID,
              GroupName: groupName,
              Limit: 60,
              NextToken: nextToken,
            })
          );

        response.Users?.forEach((user: any) => {
          if (user.Username) allUsers.add(user.Username);
        });
        nextToken = response.NextToken;
      } while (nextToken);
    }

    return { totalUsers: allUsers.size };
  } catch (error) {
    return { success: false, error };
  }
};
