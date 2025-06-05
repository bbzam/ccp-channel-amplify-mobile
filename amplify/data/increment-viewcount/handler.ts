import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { contentId } = event.arguments;
  const ddbClient = new DynamoDBClient({});
  const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

  try {
    const params = {
      TableName: process.env.CONTENT_TABLE,
      Key: {
        id: contentId,
      },
      UpdateExpression: 'ADD viewCount :inc',
      ExpressionAttributeValues: {
        ':inc': 1,
      },
      ReturnValues: 'UPDATED_NEW' as const,
    };

    const result = await ddbDocClient.send(new UpdateCommand(params));

    return {
      success: true,
      viewCount: result.Attributes?.viewCount,
    };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: error,
    };
  }
};
