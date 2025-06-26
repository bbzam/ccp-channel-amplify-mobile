import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const userId = event.identity.claims.sub;

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    // Get all favorite records for this user
    const favoritesCommand = new ScanCommand({
      TableName: process.env.CONTENTTOUSER_TABLE,
      FilterExpression: 'userId = :userId AND isFavorite = :isFavorite',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':isFavorite': true,
      },
    });

    const { Items: favorites } = await docClient.send(favoritesCommand);

    if (!favorites || favorites.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const contentTableName = process.env.CONTENT_TABLE!;

    // Get content details for all favorites in a single batch request
    const contentCommand = new BatchGetCommand({
      RequestItems: {
        [contentTableName]: {
          Keys: favorites.map((favorite) => ({ id: favorite.contentId })),
        },
      },
    });

    const { Responses } = await docClient.send(contentCommand);
    const contents = Responses?.[contentTableName] || [];

    return {
      success: true,
      data: contents,
    };
  } catch (error) {
    console.error('Error listing user favorites:', error);
    return {
      success: false,
      error: error,
    };
  }
};
