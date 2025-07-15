import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { category, status, keyword, fields } = event.arguments;
  const userId = event.identity.claims.sub;

  try {
    const ddbClient = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(ddbClient);

    let params: any = {
      TableName: process.env.CONTENT_TABLE,
      Limit: 5000,
    };

    // Add ProjectionExpression if fields are specified
    if (fields && fields.length > 0) {
      params.ProjectionExpression = fields.join(', ');
    }

    if (category || status !== undefined || keyword) {
      let filterExpression = [];
      let expressionAttributeValues: any = {};

      if (category) {
        filterExpression.push('category = :category');
        expressionAttributeValues[':category'] = category;
      }

      if (status !== undefined) {
        filterExpression.push('#status = :status');
        expressionAttributeValues[':status'] = status;
        params.ExpressionAttributeNames = { '#status': 'status' };
      }

      if (keyword) {
        filterExpression.push(
          '(contains(title, :keyword) OR contains(description, :keyword))'
        );
        expressionAttributeValues[':keyword'] = keyword;
      }

      params.FilterExpression = filterExpression.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await docClient.send(new ScanCommand(params));

    // Skip favorites if fields are specified
    if (fields && fields.length > 0) {
      return JSON.stringify(result.Items);
    }

    // Get user favorites
    const favoritesCommand = new ScanCommand({
      TableName: process.env.CONTENTTOUSER_TABLE,
      FilterExpression: 'userId = :userId AND isFavorite = :isFavorite',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':isFavorite': true,
      },
    });

    const { Items: favorites } = await docClient.send(favoritesCommand);
    const favoriteMap = new Map(
      favorites?.map((item) => [item.contentId, true])
    );

    const dataWithFavorites = result.Items?.map((content) => ({
      ...content,
      isFavorite: favoriteMap.get(content.id) || false,
    }));

    console.log('dataWithFavorites:', JSON.stringify(dataWithFavorites));

    return JSON.stringify(dataWithFavorites);
  } catch (error) {
    console.error('Error fetching contents:', error);
    return {
      success: false,
      error: error,
    };
  }
};
