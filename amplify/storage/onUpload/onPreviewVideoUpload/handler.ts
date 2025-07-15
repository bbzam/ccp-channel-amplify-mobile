import type { S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const PREVIEW_VIDEO_CONFIG = {
  maxSizeBytes: 3 * 1024 * 1024 * 1024,
  maxDurationSeconds: 35,
  allowedTypes: ['mp4', 'mov', 'webm', 'mpeg', 'mpg', 'm4v'],
};

const VIDEO_SIGNATURES = {
  mp4: [
    [0x00, 0x00, 0x00],
    [0x66, 0x74, 0x79, 0x70],
    [0x69, 0x73, 0x6f, 0x6d],
    [0x6d, 0x70, 0x34, 0x32],
  ],
  mov: [
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
    [0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
    [0x6d, 0x6f, 0x6f, 0x76],
  ],
  m4v: [[0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20]],
  webm: [[0x1a, 0x45, 0xdf, 0xa3]],
  mpeg: [[0x47], [0x00, 0x00, 0x01, 0xba], [0x00, 0x00, 0x01, 0xb3]],
};

const s3Client = new S3Client();

function validateVideoSignature(buffer: Buffer, fileType: string): boolean {
  if (buffer.length < 4) return false;
  const signatures =
    VIDEO_SIGNATURES[fileType.toLowerCase() as keyof typeof VIDEO_SIGNATURES];
  if (!signatures) return false;
  const bufferHex = buffer.slice(0, 16).toString('hex');
  return signatures.some((signature) => {
    const signatureHex = Buffer.from(signature).toString('hex');
    return ['mp4', 'mov'].includes(fileType.toLowerCase())
      ? bufferHex.includes(signatureHex)
      : bufferHex.startsWith(signatureHex);
  });
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
    `[PREVIEW VIDEO HANDLER] Started processing ${event.Records.length} preview video(s)`
  );

  try {
    await Promise.all(
      event.Records.map(async (record) => {
        const {
          bucket: { name: bucketName },
          object: { key },
        } = record.s3;
        console.info(
          `[PREVIEW VIDEO HANDLER] Processing: ${bucketName}/${key}`
        );

        try {
          const response = await s3Client.send(
            new GetObjectCommand({ Bucket: bucketName, Key: key })
          );
          if (!response.Body) throw new Error('No file data received');

          const contentLength = response.ContentLength ?? 0;
          const fileType = key.split('.').pop()?.toLowerCase() || '';
          const contentType = response.ContentType?.toLowerCase() || '';

          console.info(
            `[PREVIEW VIDEO HANDLER] File details - Type: ${fileType}, Size: ${contentLength} bytes, ContentType: ${contentType}`
          );

          if (!PREVIEW_VIDEO_CONFIG.allowedTypes.includes(fileType)) {
            console.error(
              `[PREVIEW VIDEO HANDLER] Invalid file type: ${fileType}`
            );
            throw new Error('Invalid preview video file type');
          }
          if (contentLength > PREVIEW_VIDEO_CONFIG.maxSizeBytes) {
            console.error(
              `[PREVIEW VIDEO HANDLER] File too large: ${contentLength} bytes (max: ${PREVIEW_VIDEO_CONFIG.maxSizeBytes})`
            );
            throw new Error('Preview video exceeds size limit');
          }

          console.info(
            `[PREVIEW VIDEO HANDLER] Validating file signature for: ${fileType}`
          );
          const buffer = await streamToBuffer(response.Body);
          const headerBuffer = buffer.slice(0, 16);

          if (!validateVideoSignature(headerBuffer, fileType)) {
            console.error(
              `[PREVIEW VIDEO HANDLER] Invalid file signature for type: ${fileType}`
            );
            throw new Error('Invalid file signature');
          }

          console.info(
            `[PREVIEW VIDEO HANDLER] Successfully validated: ${key}`
          );
        } catch (error) {
          console.error(
            `[PREVIEW VIDEO HANDLER] Error processing ${key}:`,
            error
          );
          // Delete invalid file
          try {
            await s3Client.send(
              new DeleteObjectCommand({ Bucket: bucketName, Key: key })
            );
            console.info(
              `[PREVIEW VIDEO HANDLER] Deleted invalid file: ${key}`
            );
          } catch (deleteError) {
            console.error(
              `[PREVIEW VIDEO HANDLER] Failed to delete invalid file ${key}:`,
              deleteError
            );
          }
          throw error;
        }
      })
    );

    console.info(
      `[PREVIEW VIDEO HANDLER] Successfully processed all ${event.Records.length} preview video(s)`
    );
    return {
      statusCode: 200,
      message: 'Preview videos validated successfully',
    };
  } catch (error) {
    console.error(`[PREVIEW VIDEO HANDLER] Handler failed:`, error);
    throw new Error(`Preview video validation failed: ${String(error)}`);
  }
};
