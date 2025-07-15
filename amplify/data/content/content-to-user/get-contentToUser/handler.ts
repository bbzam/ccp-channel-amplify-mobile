import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { contentId } = event.arguments;
  const userId = event.identity.claims.sub;

  console.log('Event Data', event);

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    // Use a scan with filters instead of a query
    const command = new ScanCommand({
      TableName: process.env.CONTENTTOUSER_TABLE,
      FilterExpression: 'contentId = :contentId AND userId = :userId',
      ExpressionAttributeValues: {
        ':contentId': contentId,
        ':userId': userId,
      },
    });

    const { Items } = await docClient.send(command);
    console.log('ContentToUser Data:', Items);

    return {
      success: true,
      data: Items,
    };
  } catch (error) {
    console.error('Error listing Content To User:', error);
    return {
      success: false,
      error: error,
    };
  }
};
