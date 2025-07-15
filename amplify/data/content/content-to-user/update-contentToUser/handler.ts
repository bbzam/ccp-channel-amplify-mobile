import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { contentId, input } = event.arguments;
  const userId = event.requestContext.identity.sub;

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    // Build update expression and attribute values dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeValues: any = {};
    const expressionAttributeNames: any = {};

    Object.entries(input).forEach(([key, value]) => {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
      expressionAttributeNames[`#${key}`] = key;
    });

    const command = new UpdateCommand({
      TableName: process.env.API_CCPCHANNELAMPLIFY_CONTENTTOUSERTABLE_NAME,
      Key: {
        contentId: contentId,
        userId: userId,
      },
      UpdateExpression: `SET ${updateExpressions?.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    });

    const { Attributes } = await docClient.send(command);

    return {
      success: true,
      data: Attributes,
    };
  } catch (error) {
    console.error('Error updating Content To User:', error);
    return {
      success: false,
      error: error,
    };
  }
};
