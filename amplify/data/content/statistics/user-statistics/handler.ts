import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  ListUsersInGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const handler = async () => {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });

  const ddbClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(ddbClient);

  try {
    const groups = ['USER', 'SUBSCRIBER'];

    // Payment data fetch with pagination limit
    const paymentPromise = (async () => {
      const items: any[] = [];
      let lastEvaluatedKey;
      let pageCount = 0;
      const maxPages = 10;

      do {
        const response: ScanCommandOutput = await docClient.send(
          new ScanCommand({
            TableName: process.env.PAYMENTTOUSER_TABLE,
            ProjectionExpression: 'userId, subscriptionType',
            Limit: 1000,
            ExclusiveStartKey: lastEvaluatedKey,
          })
        );

        if (response.Items) items.push(...response.Items);
        lastEvaluatedKey = response.LastEvaluatedKey;
        pageCount++;
      } while (lastEvaluatedKey && pageCount < maxPages);

      return { Items: items };
    })();

    const groupPromises = groups.map(async (groupName) => {
      const users: any[] = [];
      let nextToken;
      let pageCount = 0;
      const maxPages = 5; // Limit pagination

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
        pageCount++;
      } while (nextToken && pageCount < maxPages);

      return { groupName, users };
    });

    const [groupResults, { Items: paymentData }] = await Promise.all([
      Promise.all(groupPromises),
      paymentPromise,
    ]);

    const subscriptionMap = new Set(
      paymentData
        ?.filter((item) => item.subscriptionType)
        .map((item) => item.userId) || []
    );

    const allUsers = new Map();
    const userStats = {
      totalUsers: 0,
      groupCounts: {
        USER: 0,
        PAID_SUBSCRIBER: 0,
        FREE_SUBSCRIBER: 0,
      } as Record<string, number>,
      newRegistrations: { daily: 0, weekly: 0, monthly: 0 },
    };

    const now = new Date();
    const timeThresholds = {
      daily: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      weekly: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      monthly: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    groupResults.forEach(({ groupName, users }) => {
      if (groupName === 'SUBSCRIBER') {
        users.forEach((user) => {
          if (subscriptionMap.has(user.Username)) {
            userStats.groupCounts['PAID_SUBSCRIBER']++;
          } else {
            userStats.groupCounts['FREE_SUBSCRIBER']++;
          }
        });
      } else {
        userStats.groupCounts[groupName] = users.length;
      }

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
