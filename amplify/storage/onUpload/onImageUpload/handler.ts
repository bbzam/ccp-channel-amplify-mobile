import type { S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

const IMAGE_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024,
  allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
};

const IMAGE_SIGNATURES = {
  jpg: [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe3],
    [0xff, 0xd8, 0xff, 0xdb],
  ],
  jpeg: [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe3],
    [0xff, 0xd8, 0xff, 0xdb],
  ],
  png: [[0x89, 0x50, 0x4e, 0x47]],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  bmp: [[0x42, 0x4d]],
};

const s3Client = new S3Client();

function validateImageSignature(buffer: Buffer, fileType: string): boolean {
  if (buffer.length < 4) return false;
  const signatures =
    IMAGE_SIGNATURES[fileType.toLowerCase() as keyof typeof IMAGE_SIGNATURES];
  if (!signatures) return false;
  const bufferHex = buffer.slice(0, 16).toString('hex');
  return signatures.some((signature) =>
    bufferHex.startsWith(Buffer.from(signature).toString('hex'))
  );
}

function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export const handler: S3Handler = async (event): Promise<any> => {
  console.info(
    `[IMAGE HANDLER] Started processing ${event.Records.length} image(s)`
  );

  try {
    await Promise.all(
      event.Records.map(async (record) => {
        const {
          bucket: { name: bucketName },
          object: { key },
        } = record.s3;
        console.info(`[IMAGE HANDLER] Processing: ${bucketName}/${key}`);

        try {
          const response = await s3Client.send(
            new GetObjectCommand({ Bucket: bucketName, Key: key })
          );
          if (!response.Body) throw new Error('No file data received');

          const contentLength = response.ContentLength ?? 0;
          const fileType = key.split('.').pop()?.toLowerCase() || '';
          const contentType = response.ContentType?.toLowerCase() || '';

          console.info(
            `[IMAGE HANDLER] File details - Type: ${fileType}, Size: ${contentLength} bytes, ContentType: ${contentType}`
          );

          const buffer = await streamToBuffer(response.Body);

          if (!IMAGE_CONFIG.allowedTypes.includes(fileType)) {
            console.error(`[IMAGE HANDLER] Invalid file type: ${fileType}`);
            throw new Error('Invalid image file type');
          }
          if (contentLength > IMAGE_CONFIG.maxSizeBytes) {
            console.error(
              `[IMAGE HANDLER] File too large: ${contentLength} bytes`
            );
            throw new Error('Image exceeds size limit');
          }

          const headerBuffer = buffer.slice(0, 16);
          let actualFileType = fileType;
          if (
            headerBuffer[0] === 0xff &&
            headerBuffer[1] === 0xd8 &&
            headerBuffer[2] === 0xff
          )
            actualFileType = 'jpeg';
          else if (
            headerBuffer[0] === 0x89 &&
            headerBuffer[1] === 0x50 &&
            headerBuffer[2] === 0x4e &&
            headerBuffer[3] === 0x47
          )
            actualFileType = 'png';

          console.info(`[IMAGE HANDLER] Detected file type: ${actualFileType}`);

          if (!validateImageSignature(headerBuffer, actualFileType)) {
            console.error(
              `[IMAGE HANDLER] Invalid file signature for type: ${actualFileType}`
            );
            throw new Error('Invalid file signature');
          }

          console.info(`[IMAGE HANDLER] Starting image processing for: ${key}`);

          const processedImage = await sharp(buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toBuffer();

          const processedKey = key.includes('landscape-images/')
            ? key.replace('landscape-images/', 'flattened-landscape-images/')
            : key.replace('portrait-images/', 'flattened-portrait-images/');

          console.info(
            `[IMAGE HANDLER] Uploading processed image to: ${processedKey}`
          );

          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: processedKey,
              Body: processedImage,
              ContentType: 'image/jpeg',
            })
          );

          console.info(`[IMAGE HANDLER] Deleting original file: ${key}`);
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: bucketName, Key: key })
          );

          console.info(
            `[IMAGE HANDLER] Successfully processed: ${key} -> ${processedKey}`
          );
        } catch (error) {
          console.error(`[IMAGE HANDLER] Error processing ${key}:`, error);
          // Delete invalid file
          try {
            await s3Client.send(
              new DeleteObjectCommand({ Bucket: bucketName, Key: key })
            );
            console.info(`[IMAGE HANDLER] Deleted invalid file: ${key}`);
          } catch (deleteError) {
            console.error(
              `[IMAGE HANDLER] Failed to delete invalid file ${key}:`,
              deleteError
            );
          }
          throw error;
        }
      })
    );

    console.info(
      `[IMAGE HANDLER] Successfully processed all ${event.Records.length} image(s)`
    );
    return { statusCode: 200, message: 'Images processed successfully' };
  } catch (error) {
    console.error(`[IMAGE HANDLER] Handler failed:`, error);
    throw new Error(`Image processing failed: ${String(error)}`);
  }
};
