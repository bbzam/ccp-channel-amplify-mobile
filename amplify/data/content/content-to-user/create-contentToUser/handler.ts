import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { contentId, pauseTime, isFavorite } = event.arguments;
  const userId = event.identity.claims.sub;

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    // First, increment the view count
    if (pauseTime) {
      await incrementViewCount(docClient, contentId);
    }

    // Check if a record already exists
    const existingRecord = await getExistingRecord(
      docClient,
      contentId,
      userId
    );

    if (existingRecord) {
      // Update existing record
      return await updateRecord(
        docClient,
        existingRecord.id,
        pauseTime,
        isFavorite
      );
    } else {
      // Create new record
      const item = {
        id: contentId + '-' + userId,
        contentId,
        userId,
        pauseTime,
        isFavorite: isFavorite || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const command = new PutCommand({
        TableName: process.env.CONTENTTOUSER_TABLE,
        Item: item,
      });

      await docClient.send(command);

      return {
        success: true,
        data: item,
      };
    }
  } catch (error) {
    console.error('Error creating Content To User relationship:', error);
    return {
      success: false,
      error: error,
    };
  }
};

async function incrementViewCount(
  docClient: DynamoDBDocumentClient,
  contentId: string
) {
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

  await docClient.send(new UpdateCommand(params));
}

async function getExistingRecord(
  docClient: DynamoDBDocumentClient,
  contentId: string,
  userId: string
) {
  const command = new ScanCommand({
    TableName: process.env.CONTENTTOUSER_TABLE,
    FilterExpression: 'contentId = :contentId AND userId = :userId',
    ExpressionAttributeValues: {
      ':contentId': contentId,
      ':userId': userId,
    },
  });

  const response = await docClient.send(command);
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
}

async function updateRecord(
  docClient: DynamoDBDocumentClient,
  id: string,
  pauseTime: string,
  isFavorite: boolean
) {
  const updateExpressions = [];
  const attributeValues: any = { ':updatedAt': new Date().toISOString() };

  if (pauseTime) {
    updateExpressions.push('pauseTime = :pauseTime');
    attributeValues[':pauseTime'] = pauseTime;
  }
  if (isFavorite !== null && isFavorite !== undefined) {
    updateExpressions.push('isFavorite = :isFavorite');
    attributeValues[':isFavorite'] = isFavorite;
  }

  if (updateExpressions.length === 0)
    return { success: false, error: 'No valid fields to update' };

  const command = new UpdateCommand({
    TableName: process.env.CONTENTTOUSER_TABLE,
    Key: { id },
    UpdateExpression: `SET ${updateExpressions.join(
      ', '
    )}, updatedAt = :updatedAt`,
    ExpressionAttributeValues: attributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const response = await docClient.send(command);

  return {
    success: true,
    data: response.Attributes,
  };
}
