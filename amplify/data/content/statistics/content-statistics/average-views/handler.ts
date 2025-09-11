import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async () => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

  try {
    let totalContent = 0;
    let totalViews = 0;
    let lastEvaluatedKey;

    do {
      const response: ScanCommandOutput = await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          ProjectionExpression: 'viewCount',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      response.Items?.forEach((item) => {
        const unmarshalled = unmarshall(item);
        totalContent++;
        totalViews += unmarshalled.viewCount || 0;
      });

      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return {
      averageViews: totalContent > 0 ? totalViews / totalContent : 0,
      totalViews,
    };
  } catch (error) {
    return { success: false, error };
  }
};
