import type { S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';

// Content type validation configurations
const CONTENT_VALIDATION_CONFIG = {
  VIDEO: {
    PREVIEW: {
      maxSizeBytes: 100 * 1024 * 1024,
      maxDurationSeconds: 40,
      allowedTypes: ['mp4', 'mov', 'webm', 'mpeg', 'mpg', 'm4v'],
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/mpeg',
        'video/x-m4v',
      ],
    },
    FULL: {
      maxSizeBytes: 10 * 1024 * 1024 * 1024,
      maxDurationSeconds: 10800,
      allowedTypes: ['mp4', 'mov', 'webm', 'mpeg', 'mpg', 'm4v'],
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/mpeg',
        'video/x-m4v',
      ],
    },
  },
  IMAGE: {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'],
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
    ],
    dimensions: {
      min: { width: 100, height: 100 },
      max: { width: 2000, height: 2000 },
    },
  },
};

// File signatures for validation
const FILE_SIGNATURES = {
  // Image signatures
  jpg: [
    [0xff, 0xd8, 0xff, 0xe0],
    [0xff, 0xd8, 0xff, 0xe1],
    [0xff, 0xd8, 0xff, 0xe2],
    [0xff, 0xd8, 0xff, 0xe3],
  ],
  png: [[0x89, 0x50, 0x4e, 0x47]],
  gif: [[0x47, 0x49, 0x46, 0x38]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  bmp: [[0x42, 0x4d]],
  // Video signatures
  mp4: [
    [0x00, 0x00, 0x00], // Variable length box size
    [0x66, 0x74, 0x79, 0x70], // 'ftyp'
    [0x69, 0x73, 0x6f, 0x6d], // 'isom'
    [0x6d, 0x70, 0x34, 0x32], // 'mp42'
  ],
  mov: [
    // Standard QuickTime
    [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
    // QuickTime movie
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
    // Alternative QuickTime signature
    [0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20],
    // MOV with MP4 compatibility
    [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32],
    // Generic MOV container
    [0x6d, 0x6f, 0x6f, 0x76],
  ],
  m4v: [[0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20]],
  webm: [[0x1a, 0x45, 0xdf, 0xa3]],
  mpeg: [
    [0x47], // Transport Stream
    [0x00, 0x00, 0x01, 0xba], // Program Stream
    [0x00, 0x00, 0x01, 0xb3],
  ], // MPEG Elementary Stream
} as const;

// S3 client initialization outside handler for reuse
const s3Client = new S3Client();

function validateFileSignature(buffer: Buffer, fileType: string): boolean {
  if (buffer.length < 4) return false;

  const signatures =
    FILE_SIGNATURES[fileType.toLowerCase() as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;

  // Create a hex string from the buffer for easier comparison
  const bufferHex = buffer.slice(0, 16).toString('hex');

  return signatures.some((signature) => {
    const signatureHex = Buffer.from(signature).toString('hex');

    // For MP4, MOV - check if signature exists anywhere in first 16 bytes
    if (['mp4', 'mov'].includes(fileType.toLowerCase())) {
      return bufferHex.includes(signatureHex);
    }

    // For MPEG - check if buffer starts with signature
    if (fileType.toLowerCase() === 'mpeg') {
      return signature.length === 1
        ? buffer[0] === signature[0]
        : bufferHex.startsWith(signatureHex);
    }

    // For all other types - exact match at start of buffer
    return bufferHex.startsWith(signatureHex);
  });
}

async function validateFile(bucket: string, key: string): Promise<void> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      throw new ValidationError(400, 'No file data received', false);
    }

    const contentLength = response.ContentLength ?? 0;
    const fileType = key.split('.').pop()?.toLowerCase() || '';
    const contentType = response.ContentType?.toLowerCase() || '';

    // Validate file size and type based on path
    if (
      key.includes('/landscape-images/') ||
      key.includes('/portrait-images/')
    ) {
      if (!CONTENT_VALIDATION_CONFIG.IMAGE.allowedTypes.includes(fileType)) {
        throw new ValidationError(400, 'Invalid image file type', false);
      }
      if (contentLength > CONTENT_VALIDATION_CONFIG.IMAGE.maxSizeBytes) {
        throw new ValidationError(400, 'Image exceeds size limit', false);
      }
      if (
        !CONTENT_VALIDATION_CONFIG.IMAGE.allowedMimeTypes.includes(contentType)
      ) {
        throw new ValidationError(400, 'Invalid image content type', false);
      }
    } else if (key.includes('/preview-videos/')) {
      if (
        !CONTENT_VALIDATION_CONFIG.VIDEO.PREVIEW.allowedTypes.includes(fileType)
      ) {
        throw new ValidationError(
          400,
          'Invalid preview video file type',
          false
        );
      }
      if (
        contentLength > CONTENT_VALIDATION_CONFIG.VIDEO.PREVIEW.maxSizeBytes
      ) {
        throw new ValidationError(
          400,
          'Preview video exceeds size limit',
          false
        );
      }
      if (
        !CONTENT_VALIDATION_CONFIG.VIDEO.PREVIEW.allowedMimeTypes.includes(
          contentType
        )
      ) {
        throw new ValidationError(
          400,
          'Invalid preview video content type',
          false
        );
      }
    } else if (key.includes('/full-videos/')) {
      if (
        !CONTENT_VALIDATION_CONFIG.VIDEO.FULL.allowedTypes.includes(fileType)
      ) {
        throw new ValidationError(400, 'Invalid full video file type', false);
      }
      if (contentLength > CONTENT_VALIDATION_CONFIG.VIDEO.FULL.maxSizeBytes) {
        throw new ValidationError(400, 'Full video exceeds size limit', false);
      }
      if (
        !CONTENT_VALIDATION_CONFIG.VIDEO.FULL.allowedMimeTypes.includes(
          contentType
        )
      ) {
        throw new ValidationError(
          400,
          'Invalid full video content type',
          false
        );
      }
    }

    // Read file header for signature validation
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length >= 16) break;
    }

    const headerBuffer = Buffer.concat(chunks).slice(0, 16);
    if (!validateFileSignature(headerBuffer, fileType)) {
      throw new ValidationError(400, 'Invalid file signature', false);
    }
  } catch (error) {
    await deleteFile(bucket, key);

    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(
      500,
      `File validation failed: ${String(error)}`,
      false
    );
  }
}

// async function abortUpload(bucket: string, key: string): Promise<boolean> {
//   console.log('Attempting to abort upload for bucket:', bucket, 'key:', key);

//   try {
//     const listParts = await s3Client.send(
//       new ListMultipartUploadsCommand({ Bucket: bucket })
//     );

//     if (!listParts.Uploads) {
//       console.log('No multipart uploads found');
//       return false;
//     }

//     const upload = listParts.Uploads.find((u) => u.Key === key);
//     if (!upload || !upload.UploadId) {
//       console.log(`No active multipart upload found for key: ${key}`);
//       return false;
//     }

//     await s3Client.send(
//       new AbortMultipartUploadCommand({
//         Bucket: bucket,
//         Key: key,
//         UploadId: upload.UploadId,
//       })
//     );

//     console.log(`Successfully aborted multipart upload for ${key}`);
//     return true;
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(`Failed to abort upload: ${error.message}`);
//     } else {
//       console.error('An unknown error occurred while aborting upload');
//     }
//     return false;
//   }
// }

async function deleteFile(bucket: string, key: string) {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return new SuccessResponse(200, `File deleted successfully: ${key}`, true);
  } catch (error) {
    throw new ValidationError(
      500,
      `Failed to delete file: ${String(error)}`,
      false
    );
  }
}

export const handler: S3Handler = async (event): Promise<any> => {
  try {
    const records = event.Records;
    console.info(`Upload handler invoked for ${records.length} objects`);

    await Promise.all(
      records.map(async (record) => {
        const {
          bucket: { name: bucketName },
          object: { key },
        } = record.s3;
        console.info(`Processing: ${bucketName}/${key}`);
        await validateFile(bucketName, key);
      })
    );

    return new SuccessResponse(200, 'File validated successfully', true);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new ValidationError(
      500,
      `File validation error: ${String(error)}`,
      false
    );
  }
};

class SuccessResponse {
  statusCode: number;
  success: boolean;
  message: string;
  name: string;

  constructor(statusCode: number, message: string, success: boolean) {
    this.statusCode = statusCode;
    this.success = success;
    this.message = message;
    this.name = 'SuccessResponse';

    console.info({
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      success: this.success,
    });
  }
}

class ValidationError extends Error {
  statusCode: number;
  success: boolean;

  constructor(statusCode: number, message: string, success: boolean) {
    super(message);
    this.statusCode = statusCode;
    this.success = success;
    this.name = 'ValidationError';
  }
}
