import {
  CognitoIdentityProviderClient,
  ListUsersInGroupCommand,
  ListUsersInGroupCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const handler = async () => {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });
  const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  try {
    // Get payment data
    const paymentData: any[] = [];
    let lastEvaluatedKey;
    do {
      const response: ScanCommandOutput = await docClient.send(
        new ScanCommand({
          TableName: process.env.PAYMENTTOUSER_TABLE,
          ProjectionExpression: 'userId, subscriptionType, status',
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      if (response.Items) paymentData.push(...response.Items);
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const subscriptionMap = new Set(
      paymentData
        .filter((item) => item.subscriptionType && item.status === 'S')
        .map((item) => item.userId)
    );

    const groupCounts = { USER: 0, PAID_SUBSCRIBER: 0, FREE_SUBSCRIBER: 0 };

    // Get USER group count
    let nextToken;
    do {
      const response: ListUsersInGroupCommandOutput = await cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          GroupName: 'USER',
          NextToken: nextToken,
        })
      );
      groupCounts.USER += response.Users?.length || 0;
      nextToken = response.NextToken;
    } while (nextToken);

    // Get SUBSCRIBER group and categorize
    nextToken = undefined;
    do {
      const response: ListUsersInGroupCommandOutput = await cognitoClient.send(
        new ListUsersInGroupCommand({
          UserPoolId: process.env.USER_POOL_ID,
          GroupName: 'SUBSCRIBER',
          NextToken: nextToken,
        })
      );

      response.Users?.forEach((user) => {
        if (subscriptionMap.has(user.Username)) {
          groupCounts.PAID_SUBSCRIBER++;
        } else {
          groupCounts.FREE_SUBSCRIBER++;
        }
      });
      nextToken = response.NextToken;
    } while (nextToken);

    return { groupCounts };
  } catch (error) {
    return { success: false, error };
  }
};
