import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    let lastEvaluatedKey;
    let totalContent = 0;
    let totalViews = 0;
    const contentByCategory: Record<string, { count: number; views: number }> =
      {};
    const monthlyStats: Record<string, Record<string, any>> = {};
    const topItems: Array<{ item: any; viewCount: number }> = [];
    const leastItems: Array<{ item: any; viewCount: number }> = [];
    const recentContent: any[] = [];

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
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

    let pageCount = 0;
    const maxPages = 20; // Increased for larger datasets

    do {
      const contentCommand = new ScanCommand({
        TableName: process.env.CONTENT_TABLE,
        ProjectionExpression: 'id, title, viewCount, createdAt, category',
        Limit: 1000,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const contentResponse: ScanCommandOutput = await dynamoClient.send(
        contentCommand
      );

      if (contentResponse.Items) {
        const items = contentResponse.Items.map((item) => unmarshall(item));

        // Process items in streaming fashion
        items.forEach((item) => {
          totalContent++;
          const viewCount = item.viewCount || 0;
          totalViews += viewCount;

          // Category stats
          const category = item.category || 'uncategorized';
          if (!contentByCategory[category]) {
            contentByCategory[category] = { count: 0, views: 0 };
          }
          contentByCategory[category].count++;
          contentByCategory[category].views += viewCount;

          // Top 10 tracking (maintain sorted array)
          if (topItems.length < 10) {
            topItems.push({ item, viewCount });
            topItems.sort((a, b) => b.viewCount - a.viewCount);
          } else if (viewCount > topItems[9].viewCount) {
            topItems[9] = { item, viewCount };
            topItems.sort((a, b) => b.viewCount - a.viewCount);
          }

          // Least 10 tracking
          if (leastItems.length < 10) {
            leastItems.push({ item, viewCount });
            leastItems.sort((a, b) => a.viewCount - b.viewCount);
          } else if (viewCount < leastItems[9].viewCount) {
            leastItems[9] = { item, viewCount };
            leastItems.sort((a, b) => a.viewCount - b.viewCount);
          }

          // Recent content (last week)
          if (item.createdAt && new Date(item.createdAt) > oneWeekAgo) {
            if (recentContent.length < 5) {
              recentContent.push(item);
              recentContent.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            } else if (
              new Date(item.createdAt) > new Date(recentContent[4].createdAt)
            ) {
              recentContent[4] = item;
              recentContent.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            }
          }

          // Monthly stats
          if (item.createdAt) {
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

            const stats = monthlyStats[year][monthName];
            stats.count++;
            stats.totalViews += viewCount;
            stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
          }
        });
      }

      lastEvaluatedKey = contentResponse.LastEvaluatedKey;
      pageCount++;
    } while (lastEvaluatedKey && pageCount < maxPages);

    if (totalContent === 0) {
      return { success: false, error: 'No content found' };
    }

    // Calculate average views for monthly stats
    Object.values(monthlyStats).forEach((yearStats) => {
      Object.values(yearStats).forEach((stats: any) => {
        stats.averageViews =
          stats.count > 0 ? stats.totalViews / stats.count : 0;
      });
    });

    return {
      totalContent,
      topViewedContent: topItems.map((t) => t.item),
      contentByCategory,
      leastViewedContent: leastItems.map((t) => t.item),
      averageViews: totalViews / totalContent,
      totalViews,
      recentContent,
      monthlyStats,
    };
  } catch (error) {
    console.error('Error fetching content statistics:', error);
    return { success: false, error: error };
  }
};
