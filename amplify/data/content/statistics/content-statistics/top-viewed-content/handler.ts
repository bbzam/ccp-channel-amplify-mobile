import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    const topItems: Array<{ item: any; viewCount: number }> = [];
    let lastEvaluatedKey;

    do {
      const response: ScanCommandOutput = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          ProjectionExpression: 'id, title, viewCount',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      response.Items?.forEach((item) => {
        const unmarshalled = unmarshall(item);
        const viewCount = unmarshalled.viewCount || 0;

        if (topItems.length < 10) {
          topItems.push({ item: unmarshalled, viewCount });
          topItems.sort((a, b) => b.viewCount - a.viewCount);
        } else if (viewCount > topItems[9].viewCount) {
          topItems[9] = { item: unmarshalled, viewCount };
          topItems.sort((a, b) => b.viewCount - a.viewCount);
        }
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { topViewedContent: topItems.map((t) => t.item) };
  } catch (error) {
    return { success: false, error };
  }
};
