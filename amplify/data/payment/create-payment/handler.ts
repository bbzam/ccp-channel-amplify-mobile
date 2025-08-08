import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const https = require('https');
const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event: any) => {
  try {
    console.log('Event:', event);
    console.log('Event Identity:', event.identity);
    console.log('Event Identity Claims:', event.identity.claims);

    const transactionId = crypto.randomUUID();
    const url = `${process.env.PAYMENT_URL}/${transactionId}/post` || '';
    const merchantId = process.env.MERCHANT_ID;
    const apiKey = process.env.API_KEY;

    const amount = event.arguments.rate === 'M' ? '99' : '599';  // M (monthly) A (Annual)
    const userId = event.identity.claims.sub;

    const payload = {
      Amount: amount,
      Currency: 'PHP',
      Description: 'Payment',
      Email: event.arguments.email,
      ProcId: event.arguments.ProcId,
    };

    console.log('payload', payload);

    const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString(
      'base64'
    );
    const postData = JSON.stringify(payload);

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        Authorization: `Basic ${credentials}`,
      },
    };

    //Save transaction details to database
    const transaction = {
      id: transactionId,
      userId: userId,
      subscriptionType: event.arguments.rate,
      status: '',
      message: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('transaction details', transaction);

    const command = new PutItemCommand({
      TableName: process.env.PAYMENTTOUSER_TABLE,
      Item: marshall(transaction),
    });

    await dynamoClient.send(command);

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: any) => {
        let data = '';

        res.on('data', (chunk: any) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);

            console.log('Response:', parsed);

            if (parsed.Status === 'S') {
              resolve({
                success: true,
                data: parsed.Url,
              });
            } else {
              resolve({
                success: false,
                error: 'Please try again later',
              });
            }
          } catch (e) {
            reject({
              success: false,
              error: 'Invalid response format',
            });
          }
        });
      });

      req.on('error', (err: any) => {
        reject({
          success: false,
          error: err.message,
        });
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return {
      success: false,
      error: error,
    };
  }
};
