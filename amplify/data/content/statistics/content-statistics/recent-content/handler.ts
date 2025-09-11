import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    const recentContent: any[] = [];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let lastEvaluatedKey;

    do {
      const response: ScanCommandOutput = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          ProjectionExpression: 'id, title, createdAt',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      response.Items?.forEach((item) => {
        const unmarshalled = unmarshall(item);

        if (
          unmarshalled.createdAt &&
          new Date(unmarshalled.createdAt) > oneWeekAgo
        ) {
          if (recentContent.length < 5) {
            recentContent.push(unmarshalled);
            recentContent.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          } else if (
            new Date(unmarshalled.createdAt) >
            new Date(recentContent[4].createdAt)
          ) {
            recentContent[4] = unmarshalled;
            recentContent.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          }
        }
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { recentContent };
  } catch (error) {
    return { success: false, error };
  }
};
