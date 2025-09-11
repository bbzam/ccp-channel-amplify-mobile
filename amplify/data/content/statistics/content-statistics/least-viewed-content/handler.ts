import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    const leastItems: Array<{ item: any; viewCount: number }> = [];
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

        if (leastItems.length < 10) {
          leastItems.push({ item: unmarshalled, viewCount });
          leastItems.sort((a, b) => a.viewCount - b.viewCount);
        } else if (viewCount < leastItems[9].viewCount) {
          leastItems[9] = { item: unmarshalled, viewCount };
          leastItems.sort((a, b) => a.viewCount - b.viewCount);
        }
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { leastViewedContent: leastItems.map((t) => t.item) };
  } catch (error) {
    return { success: false, error };
  }
};
