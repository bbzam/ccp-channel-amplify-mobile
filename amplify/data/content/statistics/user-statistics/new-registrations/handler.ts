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
    const now = new Date();
    const timeThresholds = {
      daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    const newRegistrations = { daily: 0, weekly: 0, monthly: 0 };
    const processedUsers = new Set();

    for (const groupName of ['USER', 'SUBSCRIBER']) {
      let nextToken;
      do {
        const response: ListUsersInGroupCommandOutput =
          await cognitoClient.send(
            new ListUsersInGroupCommand({
              UserPoolId: process.env.USER_POOL_ID,
              GroupName: groupName,
              NextToken: nextToken,
            })
          );

        response.Users?.forEach((user) => {
          if (
            user.Username &&
            !processedUsers.has(user.Username) &&
            user.UserCreateDate
          ) {
            processedUsers.add(user.Username);
            const createDate = new Date(user.UserCreateDate);

            if (createDate >= timeThresholds.daily) newRegistrations.daily++;
            if (createDate >= timeThresholds.weekly) newRegistrations.weekly++;
            if (createDate >= timeThresholds.monthly)
              newRegistrations.monthly++;
          }
        });
        nextToken = response.NextToken;
      } while (nextToken);
    }

    return { newRegistrations };
  } catch (error) {
    return { success: false, error };
  }
};
