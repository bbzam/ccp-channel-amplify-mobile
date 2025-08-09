import {
  DynamoDBClient,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    await Promise.all(
      event.Records.map(async (record: any) => {
        const {
          object: { key },
        } = record.s3;

        const inputKey =
          key.split('/')[0].replace('processed-', '') + '/' + key.split('/')[1];

        console.log('inputKey:', inputKey);

        const scanCommand = new ScanCommand({
          TableName: process.env.CONTENT_TABLE,
          FilterExpression: 'fullVideoUrl = :inputKey',
          ExpressionAttributeValues: marshall({
            ':inputKey': inputKey,
          }),
        });

        const response = await dynamoClient.send(scanCommand);

        console.log('Response:', response);

        if (response.Items && response.Items.length > 0) {
          const item = unmarshall(response.Items[0]);
          const contentId = item.id;

          console.log('Content ID:', contentId);

          const updateCommand = new UpdateItemCommand({
            TableName: process.env.CONTENT_TABLE,
            Key: marshall({ id: contentId }),
            UpdateExpression:
              'SET processedFullVideoUrl = :processedUrl, updatedAt = :updatedAt',
            ExpressionAttributeValues: marshall({
              ':processedUrl': key,
              ':updatedAt': new Date().toISOString(),
            }),
          });

          await dynamoClient.send(updateCommand);
        }
      })
    );
  } catch (error) {
    console.error('❌ Error processing:', error);
    throw error;
  }
};
