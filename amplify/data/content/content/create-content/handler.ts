import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const validateCustomFields = async (
  customFields: any,
  dynamoClient: DynamoDBClient
) => {
  if (!customFields) return [];

  try {
    // Handle both string and object formats
    let parsedCustomFields;
    if (typeof customFields === 'string') {
      parsedCustomFields = JSON.parse(customFields);
    } else if (typeof customFields === 'object') {
      parsedCustomFields = customFields;
    } else {
      return ['Invalid custom fields format'];
    }

    const fieldIds = Object.keys(parsedCustomFields);
    if (fieldIds.length === 0) return [];

    // Get all existing custom fields from database
    const scanCommand = new ScanCommand({
      TableName: process.env.CUSTOMFIELDS_TABLE,
      ProjectionExpression: 'id, fieldName',
    });

    const result = await dynamoClient.send(scanCommand);
    const existingFields = result.Items?.map((item) => unmarshall(item)) || [];
    const validFieldIds = existingFields.map((field) => field.id);

    // Check if all provided field IDs exist
    const invalidFields = fieldIds.filter(
      (fieldId) => !validFieldIds.includes(fieldId)
    );

    if (invalidFields.length > 0) {
      return [`Invalid custom field IDs: ${invalidFields.join(', ')}`];
    }

    return [];
  } catch (error) {
    return ['Invalid custom fields format'];
  }
};

const validateContent = async (args: any, dynamoClient: DynamoDBClient) => {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  // Required field validations
  if (!args.title?.trim()) errors.push('Title is required');
  if (!args.description?.trim()) errors.push('Description is required');
  if (!args.category) errors.push('Category is required');
  if (!args.userType) errors.push('User type is required');
  if (!args.landscapeImageUrl?.trim())
    errors.push('Landscape image is required');
  if (!args.portraitImageUrl?.trim()) errors.push('Portrait image is required');
  if (!args.previewVideoUrl?.trim()) errors.push('Preview video is required');
  if (!args.fullVideoUrl?.trim()) errors.push('Full video is required');
  if (!args.resolution?.trim()) errors.push('Resolution is required');
  if (typeof args.status !== 'boolean') errors.push('Status is required');
  if (typeof args.runtime !== 'number' || args.runtime <= 0)
    errors.push('Runtime must be a positive number');

  // Disallowed characters validation
  const disallowedRegex =
    /javascript:|data:|vbscript:|on\w+\s*=|style\s*=|alert\s*\(|confirm\s*\(|prompt\s*\(|eval\s*\(|<script|<iframe|<object|<embed/i;

  const fieldsToCheck = [
    'title',
    'description',
    'category',
    'subCategory',
    'director',
    'writer',
    'yearReleased',
    'userType',
  ];
  fieldsToCheck.forEach((field) => {
    if (args[field] && disallowedRegex.test(args[field])) {
      errors.push(`${field} contains disallowed characters`);
    }
  });

  // Enum validations
  const validCategories = [
    'theater',
    'film',
    'music',
    'dance',
    'education',
    'ccpspecials',
    'ccpclassics',
  ];
  if (args.category && !validCategories.includes(args.category)) {
    errors.push('Invalid category');
  }

  const validUserTypes = ['free', 'subscriber'];
  if (args.userType && !validUserTypes.includes(args.userType)) {
    errors.push('Invalid user type');
  }

  // Year validation - handle both string and number
  if (args.yearReleased) {
    const yearValue =
      typeof args.yearReleased === 'string'
        ? args.yearReleased
        : String(args.yearReleased);
    const yearPattern = /^[0-9]{4}$/;
    if (!yearPattern.test(yearValue)) {
      errors.push('Please enter a valid 4-digit year');
    } else {
      const year = parseInt(yearValue);
      if (year < 1900) errors.push('Year must be 1900 or later');
      if (year > currentYear)
        errors.push(`Year cannot be later than ${currentYear}`);
    }
  }

  // Date validation
  if (args.publishDate && isNaN(Date.parse(args.publishDate))) {
    errors.push('Invalid publish date format');
  }

  // Custom fields validation
  if (args.customFields) {
    const customFieldErrors = await validateCustomFields(
      args.customFields,
      dynamoClient
    );
    errors.push(...customFieldErrors);
  }

  return errors;
};

export const handler = async (event: any) => {
  const dynamoClient = new DynamoDBClient({ region: process.env.REGION });
  const lambdaClient = new LambdaClient({ region: process.env.REGION });
  const s3Client = new S3Client();

  try {
    const { arguments: args } = event;

    // Validate input
    const validationErrors = await validateContent(args, dynamoClient);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
      };
    }

    const contentItem = {
      id: crypto.randomUUID(),
      __typename: 'Content',
      title: args.title.trim(),
      description: args.description.trim(),
      category: args.category,
      subCategory: args.subCategory?.trim() || null,
      director: args.director?.trim() || null,
      writer: args.writer?.trim() || null,
      yearReleased: args.yearReleased ? String(args.yearReleased) : null,
      userType: args.userType,
      landscapeImageUrl: args.landscapeImageUrl.trim(),
      portraitImageUrl: args.portraitImageUrl.trim(),
      previewVideoUrl: args.previewVideoUrl.trim(),
      fullVideoUrl: args.fullVideoUrl.trim(),
      runtime: args.runtime,
      resolution: args.resolution.trim(),
      status: args.status,
      publishDate: args.publishDate || null,
      viewCount: 0,
      customFields: args.customFields
        ? (() => {
            let parsedCustomFields;
            if (typeof args.customFields === 'string') {
              parsedCustomFields = JSON.parse(args.customFields);
            } else {
              parsedCustomFields = args.customFields;
            }

            return parsedCustomFields;
          })()
        : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutItemCommand({
      TableName: process.env.CONTENT_TABLE,
      Item: marshall(contentItem),
    });

    await dynamoClient.send(command);

    console.log('Content created:', contentItem);

    // Create folder inside processed-full-videos using key as folder name
    const folderKey = `processed-${contentItem.fullVideoUrl}/${contentItem.id}.folder`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: folderKey,
        Body: '',
      })
    );

    console.info(`[FULL VIDEO HANDLER] Created folder: ${folderKey}`);

    // Create Media Convert
    const AWS = require('aws-sdk');
    const MEDIACONVERT_ROLE = process.env.MEDIACONVERT_ROLE;
    const OUTPUT_BUCKET = process.env.BUCKET_NAME;
    const SPEKE_URL = process.env.SPEKE_URL;
    const RESOURCE_ID = crypto.randomUUID(); // can also generate dynamically
    let mediaconvert;

    // const record = event.Records[0];
    const bucket = OUTPUT_BUCKET;
    const key = decodeURIComponent(contentItem.fullVideoUrl);
    const inputS3Url = `s3://${bucket}/${key}`;

    console.log('inputS3Url:', inputS3Url);

    // Get MediaConvert endpoint (only once per Lambda cold start)
    if (!mediaconvert) {
      const mediaconvertClient = new AWS.MediaConvert({
        region: process.env.REGION,
      });
      const endpoints = await mediaconvertClient.describeEndpoints().promise();
      mediaconvert = new AWS.MediaConvert({
        endpoint: endpoints.Endpoints[0].Url,
        region: process.env.REGION,
      });
    }

    const jobParams = {
      Role: MEDIACONVERT_ROLE,
      Settings: {
        Inputs: [
          {
            FileInput: inputS3Url,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: 'DEFAULT',
              },
            },
            VideoSelector: {
              ColorSpace: 'FOLLOW',
            },
          },
        ],
        OutputGroups: [
          {
            Name: 'DASH ISO',
            OutputGroupSettings: {
              Type: 'DASH_ISO_GROUP_SETTINGS',
              DashIsoGroupSettings: {
                SegmentLength: 6,
                FragmentLength: 2,
                SegmentControl: 'SEGMENTED_FILES',
                Destination: `s3://${OUTPUT_BUCKET}/processed-${contentItem.fullVideoUrl}/`,
                Encryption: {
                  SpekeKeyProvider: {
                    Url: SPEKE_URL,
                    SystemIds: [
                      'edef8ba9-79d6-4ace-a3c8-27dcd51d21ed', // Widevine
                      '9a04f079-9840-4286-ab92-e65be0885f95', // PlayReady
                    ],
                    ResourceId: RESOURCE_ID,
                  },
                },
              },
            },
            Outputs: [
              {
                NameModifier: '_1920x1080', // Optional - appends to filenames
                ContainerSettings: {
                  Container: 'MPD',
                },
                VideoDescription: {
                  Width: 1920,
                  Height: 1080,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 8500000,
                      RateControlMode: 'QVBR',
                      SceneChangeDetect: 'TRANSITION_DETECTION',
                      QualityTuningLevel: 'MULTI_PASS_HQ',
                    },
                  },
                },
              },
              {
                NameModifier: '_1280x720', // Optional - appends to filenames
                ContainerSettings: {
                  Container: 'MPD',
                },
                VideoDescription: {
                  Width: 1280,
                  Height: 720,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 3000000,
                      RateControlMode: 'QVBR',
                      SceneChangeDetect: 'TRANSITION_DETECTION',
                      QualityTuningLevel: 'MULTI_PASS_HQ',
                    },
                  },
                },
              },
              {
                NameModifier: '_854x480', // Optional - appends to filenames
                ContainerSettings: {
                  Container: 'MPD',
                },
                VideoDescription: {
                  Width: 854,
                  Height: 480,
                  CodecSettings: {
                    Codec: 'H_264',
                    H264Settings: {
                      MaxBitrate: 1500000,
                      RateControlMode: 'QVBR',
                      SceneChangeDetect: 'TRANSITION_DETECTION',
                      QualityTuningLevel: 'MULTI_PASS_HQ',
                    },
                  },
                },
              },
              {
                NameModifier: '_audio',
                ContainerSettings: {
                  Container: 'MPD',
                },
                AudioDescriptions: [
                  {
                    AudioSourceName: 'Audio Selector 1',
                    CodecSettings: {
                      Codec: 'AAC',
                      AacSettings: {
                        Bitrate: 192000,
                        CodingMode: 'CODING_MODE_2_0',
                        SampleRate: 48000,
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const result = await mediaconvert.createJob(jobParams).promise();
    console.log('MediaConvert job created:', result.Job.Id);

    return {
      success: true,
      data: contentItem,
    };
  } catch (error) {
    console.error('Error creating content:', error);
    return {
      success: false,
      error: error,
    };
  }
};
