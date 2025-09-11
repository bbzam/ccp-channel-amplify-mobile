import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    const contentByCategory: Record<string, { count: number; views: number }> =
      {};
    let lastEvaluatedKey;

    do {
      const response: ScanCommandOutput = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          ProjectionExpression: 'category, viewCount',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      response.Items?.forEach((item) => {
        const unmarshalled = unmarshall(item);
        const category = unmarshalled.category || 'uncategorized';
        const viewCount = unmarshalled.viewCount || 0;

        if (!contentByCategory[category]) {
          contentByCategory[category] = { count: 0, views: 0 };
        }
        contentByCategory[category].count++;
        contentByCategory[category].views += viewCount;
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { contentByCategory };
  } catch (error) {
    return { success: false, error };
  }
};
