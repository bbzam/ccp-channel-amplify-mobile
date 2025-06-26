import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const userId = event.identity.claims.sub;

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    const command = new ScanCommand({
      TableName: process.env.CONTENTTOUSER_TABLE,
      FilterExpression:
        'userId = :userId AND attribute_exists(pauseTime) AND pauseTime <> :nullValue',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':nullValue': null,
      },
    });

    console.log('ScanCommand:', command);

    const { Items } = await docClient.send(command);

    console.log('Items:', Items);

    return {
      success: true,
      data: Items || [],
    };
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return {
      success: false,
      error: error,
    };
  }
};
