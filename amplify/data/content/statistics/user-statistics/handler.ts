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

    const groupPromises = groups.map(async (groupName) => {
      const users: any[] = [];
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

        if (response.Users) users.push(...response.Users);
        nextToken = response.NextToken;
      } while (nextToken);

      return { groupName, users };
    });

    const groupResults = await Promise.all(groupPromises);

    const allUsers = new Map();
    const userStats = {
      totalUsers: 0,
      groupCounts: {} as Record<string, number>,
      newRegistrations: { daily: 0, weekly: 0, monthly: 0 },
    };

    const now = new Date();
    const timeThresholds = {
      daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    groupResults.forEach(({ groupName, users }) => {
      userStats.groupCounts[groupName] = users.length;

      users.forEach((user) => {
        if (user.Username && !allUsers.has(user.Username)) {
          allUsers.set(user.Username, user);

          if (user.UserCreateDate) {
            const createDate = new Date(user.UserCreateDate);
            if (createDate >= timeThresholds.daily)
              userStats.newRegistrations.daily++;
            if (createDate >= timeThresholds.weekly)
              userStats.newRegistrations.weekly++;
            if (createDate >= timeThresholds.monthly)
              userStats.newRegistrations.monthly++;
          }
        }
      });
    });

    userStats.totalUsers = allUsers.size;
    return userStats;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return { success: false, error: error };
  }
};
