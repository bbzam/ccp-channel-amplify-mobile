import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  AdminListUserAuthEventsCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { config } from '../../../config';

export const handler = async (event: any) => {
  const dynamoClient = new DynamoDBClient({ region: config.REGION });
  const cognitoClient = new CognitoIdentityProviderClient({
    region: config.REGION,
  });

  try {
    // 1. Get content statistics
    const contentCommand = new ScanCommand({
      TableName: config.CONTENT_TABLE,
      ProjectionExpression: 'id, title, viewCount, createdAt, category',
    });

    const contentResponse = await dynamoClient.send(contentCommand);

    if (!contentResponse.Items || contentResponse.Items.length === 0) {
      return {
        success: false,
        error: 'No content found',
      };
    }

    // Convert DynamoDB items to regular JavaScript objects
    const allContent = contentResponse.Items.map((item) => unmarshall(item));

    // Calculate content statistics
    const totalContentCount = allContent.length;
    const contentByCategory = allContent.reduce(
      (acc: Record<string, { count: number; views: number }>, item) => {
        const category = item.category || 'uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, views: 0 };
        }
        acc[category].count += 1;
        acc[category].views += item.viewCount || 0;
        return acc;
      },
      {}
    );

    // Get top 10 viewed content
    const top10Items = [...allContent]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .sort(() => Math.random() - 0.5);

    // Get 10 least viewed content
    const leastViewedContent = [...allContent]
      .sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0))
      .slice(0, 10)
      .sort(() => Math.random() - 0.5);

    // Calculate average view count
    const totalViews = allContent.reduce(
      (sum, item) => sum + (item.viewCount || 0),
      0
    );
    const averageViews = totalViews / allContent.length;

    // Get recently added content (last 7 days)
    const contentOneWeekAgo = new Date();
    contentOneWeekAgo.setDate(contentOneWeekAgo.getDate() - 7);
    const recentContent = allContent
      .filter((item) => new Date(item.createdAt) > contentOneWeekAgo)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    // Calculate monthly statistics with year and month name format
    const monthlyStats: Record<string, Record<string, any>> = {};
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Group content by year and month
    allContent.forEach((item) => {
      if (!item.createdAt) return;

      const date = new Date(item.createdAt);
      const year = date.getFullYear().toString();
      const monthName = monthNames[date.getMonth()];

      if (!monthlyStats[year]) {
        monthlyStats[year] = {};
      }

      if (!monthlyStats[year][monthName]) {
        monthlyStats[year][monthName] = {
          count: 0,
          totalViews: 0,
          byCategory: {},
        };
      }

      monthlyStats[year][monthName].count++;
      monthlyStats[year][monthName].totalViews += item.viewCount || 0;

      const category = item.category || 'uncategorized';
      monthlyStats[year][monthName].byCategory[category] =
        (monthlyStats[year][monthName].byCategory[category] || 0) + 1;
    });

    // Calculate average views for each month
    Object.keys(monthlyStats).forEach((year) => {
      Object.keys(monthlyStats[year]).forEach((month) => {
        const stats = monthlyStats[year][month];
        stats.averageViews =
          stats.count > 0 ? stats.totalViews / stats.count : 0;
      });
    });

    // 2. Get user statistics
    const groups = [{ GroupName: 'USER' }, { GroupName: 'SUBSCRIBER' }];

    const userStats = {
      totalUsers: 0,
      groupCounts: {} as Record<string, number>,
      // activeUsers: 0,
      // inactiveUsers: 0,
      newRegistrations: {
        daily: 0,
        weekly: 0,
        monthly: 0,
      },
    };

    // Track all users for activity analysis
    const allUsers: any[] = [];
    const uniqueUsernames = new Set<string>();
    const now = new Date();
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1);
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    for (const group of groups) {
      const groupName = group.GroupName as string;
      let nextToken: string | undefined;

      do {
        const usersResponse = await cognitoClient.send(
          new ListUsersInGroupCommand({
            UserPoolId: config.USER_POOL_ID,
            GroupName: groupName,
            Limit: 60,
            NextToken: nextToken,
          })
        );

        if (usersResponse.Users) {
          // Add only unique users to allUsers
          for (const user of usersResponse.Users) {
            if (user.Username && !uniqueUsernames.has(user.Username)) {
              uniqueUsernames.add(user.Username);
              allUsers.push(user);
            }
          }
          userStats.groupCounts[groupName] =
            (userStats.groupCounts[groupName] || 0) +
            usersResponse.Users.length;
        }

        nextToken = usersResponse.NextToken;
      } while (nextToken);
    }

    userStats.totalUsers = allUsers.length;

    // Process user activity and registration dates
    for (const user of allUsers) {
      // Check user creation date for new registrations
      if (user.UserCreateDate) {
        const createDate = new Date(user.UserCreateDate);
        if (createDate >= oneDayAgo) {
          userStats.newRegistrations.daily++;
        }
        if (createDate >= oneWeekAgo) {
          userStats.newRegistrations.weekly++;
        }
        if (createDate >= oneMonthAgo) {
          userStats.newRegistrations.monthly++;
        }
      }

      // // Check for recent activity (last 30 days)
      // if (!user.Username) {
      //   userStats.inactiveUsers++;
      //   continue;
      // }

      // try {
      //   const authEventsCommand = new AdminListUserAuthEventsCommand({
      //     UserPoolId: config.USER_POOL_ID,
      //     Username: user.Username,
      //     MaxResults: 1,
      //   });

      //   const authEvents = await cognitoClient.send(authEventsCommand);

      //   if (
      //     authEvents.AuthEvents &&
      //     authEvents.AuthEvents.length > 0 &&
      //     authEvents.AuthEvents[0].CreationDate
      //   ) {
      //     const lastEvent = new Date(authEvents.AuthEvents[0].CreationDate);
      //     if (lastEvent >= oneMonthAgo) {
      //       userStats.activeUsers++;
      //     } else {
      //       userStats.inactiveUsers++;
      //     }
      //   } else {
      //     userStats.inactiveUsers++;
      //   }
      // } catch (error) {
      //   console.error(
      //     `Error getting auth events for user ${user.Username}:`,
      //     error
      //   );
      //   userStats.inactiveUsers++;
      // }
    }

    return {
      contentStats: {
        totalContent: totalContentCount,
        topViewedContent: top10Items,
        contentByCategory,
        leastViewedContent: leastViewedContent,
        averageViews,
        totalViews,
        recentContent,
        monthlyStats,
      },
      userStats,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      success: false,
      error: error,
    };
  }
};
