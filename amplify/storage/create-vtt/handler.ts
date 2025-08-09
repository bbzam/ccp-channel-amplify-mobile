import fs, { createWriteStream, writeFileSync } from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import util from 'util';
import { pipeline } from 'stream/promises';
import { exec as _exec } from 'child_process';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { config } from '../../config';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const exec = util.promisify(_exec);

const s3 = new S3Client({ region: process.env.REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.REGION });

const INTERVAL = 20;
const TILE_WIDTH = 160;
const TILE_HEIGHT = 90;
const TILES_PER_ROW = 5;

export const handler = async (event: any) => {
  try {
    console.log('event', event);
    console.log('requestParameters', event.Records[0].requestParameters);
    console.log('s3', event.Records[0].s3);
    await Promise.all(
      event.Records.map(async (record: any) => {
        console.log('record', record);
        const {
          bucket: { name: bucketName },
          object: { key },
        } = record.s3;
        try {
          const inputKey =
            key.split('/')[0].replace('processed-', '') +
            '/' +
            key.split('/')[1];
          const contentId = key.split('/')[2].replace('.folder', '');

          console.log('File Key:', inputKey);
          console.log('ID:', contentId);
          console.log(`📥 Processing video: ${record}`);
          console.log(inputKey, 'Test');
          const ext = path.extname(inputKey); // .mp4, .mov, etc.
          const cleanName = path.basename(inputKey, ext);
          const suffix = inputKey.split('/').pop();
          const folder = `processed-full-videos/${suffix}`;
          const basePath = `/tmp/${suffix}`;
          const inputPath = path.join(basePath, `${cleanName}.ts`);
          const spritePath = path.join(basePath, `thumbs_%04d.jpg`);
          const vttPath = path.join(basePath, 'thumbs.vtt');

          await fsp.mkdir(basePath, { recursive: true });

          const downloadFromS3 = async (key: string, destPath: string) => {
            const response = await s3.send(
              new GetObjectCommand({ Bucket: bucketName, Key: key })
            );

            const writeStream = createWriteStream(destPath);

            if (
              response.Body &&
              typeof (response.Body as Readable).pipe === 'function'
            ) {
              await pipeline(response.Body as Readable, writeStream);
            } else if (
              response.Body &&
              'transformToByteArray' in response.Body
            ) {
              const buffer = Buffer.from(
                await response.Body.transformToByteArray()
              );
              writeFileSync(destPath, buffer);
            } else {
              throw new Error('Unsupported response body format');
            }
          };

          if (!fs.existsSync(inputPath)) {
            await downloadFromS3(inputKey, inputPath);
          }

          const { stdout } = await exec(
            `/opt/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
          );
          const totalSecs = parseFloat(stdout.trim());
          const totalThumbs = Math.floor(totalSecs / INTERVAL);

          await exec(
            `/opt/bin/ffmpeg -i "${inputPath}" -t ${totalSecs} -vf "fps=1/${INTERVAL},scale=${TILE_WIDTH}:${TILE_HEIGHT}" -qscale:v 5 "${spritePath}"`
          );

          const generateVtt = (totalThumbs: any) => {
            let vtt = 'WEBVTT\n\n';
            for (let i = 0; i < totalThumbs; i++) {
              const row = Math.floor(i / TILES_PER_ROW);
              const col = i % TILES_PER_ROW;
              const x = col * TILE_WIDTH;
              const y = row * TILE_HEIGHT;
              const start = new Date(i * INTERVAL * 1000)
                .toISOString()
                .substr(11, 8);
              const end = new Date((i + 1) * INTERVAL * 1000)
                .toISOString()
                .substr(11, 8);
              const paddedIndex = String(i + 1).padStart(4, '0');
              vtt += `${start}.000 --> ${end}.000\nthumbs_${paddedIndex}.jpg#xywh=${x},${y},${TILE_WIDTH},${TILE_HEIGHT}\n\n`;
            }
            return vtt;
          };

          fs.writeFileSync(vttPath, generateVtt(totalThumbs));

          const uploadToS3 = (filePath: any, key: any, contentType: any) =>
            s3.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: fs.readFileSync(filePath),
                ContentType: contentType,
              })
            );

          await uploadToS3(vttPath, `${folder}/thumbs.vtt`, 'text/vtt');

          const files = await fsp.readdir(basePath);
          const thumbs = files.filter((f) => /^thumbs_\d{4}\.jpg$/.test(f));
          await Promise.all(
            thumbs.map((f) =>
              uploadToS3(path.join(basePath, f), `${folder}/${f}`, 'image/jpeg')
            )
          );

          console.log(
            `✅ Sprite and VTT successfully generated for ${inputKey}`
          );

          console.log('Content ID:', contentId);

          await dynamoClient.send(
            new UpdateItemCommand({
              TableName: process.env.CONTENT_TABLE,
              Key: marshall({ id: contentId }),
              UpdateExpression: 'SET vttUrl = :vttUrl, updatedAt = :updatedAt',
              ExpressionAttributeValues: marshall({
                ':vttUrl': `${folder}/thumbs.vtt`,
                ':updatedAt': new Date().toISOString(),
              }),
            })
          );

          return;
        } catch (error) {
          console.error('❌ Error processing video:', error);
          throw error;
        }
      })
    );
  } catch (error) {
    console.error('❌ Error processing video:', error);
    throw error;
  }
};
