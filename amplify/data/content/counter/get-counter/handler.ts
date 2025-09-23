import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async () => {
  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    const params = {
      TableName: process.env.COUNTER_TABLE,
    };

    const result = await docClient.send(new ScanCommand(params));

    const counters = result.Items?.reduce((acc: any, item: any) => {
      acc[item.counterName] = item.counter || 0;
      return acc;
    }, {});

    return counters;
  } catch (error) {
    console.error('Error fetching counters:', error);
    return { success: false, error: 'Failed to fetch counters' };
  }
};
