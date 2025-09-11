import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
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
    let lastEvaluatedKey;

    do {
      const response: ScanCommandOutput = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          ProjectionExpression: 'createdAt, viewCount, category',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      response.Items?.forEach((item) => {
        const unmarshalled = unmarshall(item);

        if (unmarshalled.createdAt) {
          const date = new Date(unmarshalled.createdAt);
          const year = date.getFullYear().toString();
          const monthName = monthNames[date.getMonth()];
          const category = unmarshalled.category || 'uncategorized';
          const viewCount = unmarshalled.viewCount || 0;

          if (!monthlyStats[year]) monthlyStats[year] = {};
          if (!monthlyStats[year][monthName]) {
            monthlyStats[year][monthName] = {
              count: 0,
              totalViews: 0,
              byCategory: {},
            };
          }

          const stats = monthlyStats[year][monthName];
          stats.count++;
          stats.totalViews += viewCount;
          stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        }
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Calculate averages
    Object.values(monthlyStats).forEach((yearStats) => {
      Object.values(yearStats).forEach((stats: any) => {
        stats.averageViews =
          stats.count > 0 ? stats.totalViews / stats.count : 0;
      });
    });

    return { monthlyStats };
  } catch (error) {
    return { success: false, error };
  }
};
