import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { config } from '../../config';

export const handler = async (event: any) => {
  const client = new DynamoDBClient({ region: config.REGION });

  try {
    const command = new ScanCommand({
      TableName: config.CONTENT_TABLE,
      Limit: 10, // Limit to 10 items
      ProjectionExpression: 'title, viewCount', // Specific fields
    });

    const response = await client.send(command);
    console.log('Items:', response.Items);

    return {
      success: true,
      data: response.Items,
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      success: false,
      error: error,
    };
  }
};
