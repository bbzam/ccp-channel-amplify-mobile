import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
  const { category, status, keyword, fields, filterBy } = event.arguments;
  const userId = event.identity.claims.sub;
  const userGroups = event.identity.claims['cognito:groups'] || [];
  const isAdmin =
    userGroups.includes('SUPER_ADMIN') ||
    userGroups.includes('IT_ADMIN') ||
    userGroups.includes('CONTENT_CREATOR');
  const isSubscriber =
    userGroups.includes('SUBSCRIBER') || userGroups.includes('USER');

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

    if (category || status !== undefined || keyword || filterBy) {
      let filterExpression = [];
      let expressionAttributeValues: any = {};
      let expressionAttributeNames: any = {};

      // Existing filters
      if (category) {
        filterExpression.push('category = :category');
        expressionAttributeValues[':category'] = category;
      }

      if (status !== undefined) {
        filterExpression.push('#status = :status');
        expressionAttributeValues[':status'] = status;
        expressionAttributeNames['#status'] = 'status';
      }

      // // For filterBy - keep case-sensitive for DynamoDB
      // if (filterBy) {
      //   Object.entries(filterBy).forEach(([key, value]) => {
      //     if (value !== undefined && value !== null) {
      //       filterExpression.push(`#${key} = :${key}`);
      //       expressionAttributeValues[`:${key}`] = value;
      //       expressionAttributeNames[`#${key}`] = key;
      //     }
      //   });
      // }

      params.FilterExpression = filterExpression.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
      if (Object.keys(expressionAttributeNames).length > 0) {
        params.ExpressionAttributeNames = expressionAttributeNames;
      }
    }

    const result = await docClient.send(new ScanCommand(params));

    // Apply case-insensitive filtering after DynamoDB query
    if (keyword && result.Items) {
      const lowerKeyword = keyword.toLowerCase();
      result.Items = result.Items.filter(
        (item) =>
          item.title?.toLowerCase().includes(lowerKeyword) ||
          item.description?.toLowerCase().includes(lowerKeyword) ||
          item.subCategory?.toLowerCase().includes(lowerKeyword) ||
          item.director?.toLowerCase().includes(lowerKeyword) ||
          item.writer?.toLowerCase().includes(lowerKeyword) ||
          item.yearReleased?.toLowerCase().includes(lowerKeyword) ||
          item.resolution?.toLowerCase().includes(lowerKeyword)
      );
    }

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

    // Filter content for subscribers
    let filteredData = dataWithFavorites;
    if (isSubscriber && !isAdmin) {
      filteredData = dataWithFavorites?.filter(
        (content: any) => content.vttUrl && content.processedFullVideoUrl
      );
    }

    console.log('filteredData:', JSON.stringify(filteredData));

    return JSON.stringify(filteredData);
  } catch (error) {
    console.error('Error fetching contents:', error);
    return {
      success: false,
      error: error,
    };
  }
};
