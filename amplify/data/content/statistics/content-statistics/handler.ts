import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    let allContent: any[] = [];
    let lastEvaluatedKey;

    do {
      const contentCommand: ScanCommand = new ScanCommand({
        TableName: process.env.CONTENT_TABLE,
        ProjectionExpression: 'id, title, viewCount, createdAt, category',
        Limit: 1000,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const contentResponse: ScanCommandOutput = await dynamoClient.send(
        contentCommand
      );

      if (contentResponse.Items) {
        allContent.push(
          ...contentResponse.Items.map((item) => unmarshall(item))
        );
      }

      lastEvaluatedKey = contentResponse.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    if (allContent.length === 0) {
      return { success: false, error: 'No content found' };
    }

    const totalViews = allContent.reduce(
      (sum, item) => sum + (item.viewCount || 0),
      0
    );
    const contentByCategory = allContent.reduce(
      (acc: Record<string, { count: number; views: number }>, item) => {
        const category = item.category || 'uncategorized';
        if (!acc[category]) acc[category] = { count: 0, views: 0 };
        acc[category].count++;
        acc[category].views += item.viewCount || 0;
        return acc;
      },
      {}
    );

    const top10Items = [...allContent]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10)
      .sort(() => Math.random() - 0.5);

    const leastViewedContent = [...allContent]
      .sort((a, b) => (a.viewCount || 0) - (b.viewCount || 0))
      .slice(0, 10)
      .sort(() => Math.random() - 0.5);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentContent = allContent
      .filter((item) => new Date(item.createdAt) > oneWeekAgo)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

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

    allContent.forEach((item) => {
      if (!item.createdAt) return;
      const date = new Date(item.createdAt);
      const year = date.getFullYear().toString();
      const monthName = monthNames[date.getMonth()];

      if (!monthlyStats[year]) monthlyStats[year] = {};
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

    Object.keys(monthlyStats).forEach((year) => {
      Object.keys(monthlyStats[year]).forEach((month) => {
        const stats = monthlyStats[year][month];
        stats.averageViews =
          stats.count > 0 ? stats.totalViews / stats.count : 0;
      });
    });

    return {
      totalContent: allContent.length,
      topViewedContent: top10Items,
      contentByCategory,
      leastViewedContent,
      averageViews: totalViews / allContent.length,
      totalViews,
      recentContent,
      monthlyStats,
    };
  } catch (error) {
    console.error('Error fetching content statistics:', error);
    return { success: false, error: error };
  }
};
