import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { config } from '../../../../config';

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
      TableName: config.CUSTOMFIELDS_TABLE,
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
  const dynamoClient = new DynamoDBClient({ region: config.REGION });

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
      TableName: config.CONTENT_TABLE,
      Item: marshall(contentItem),
    });

    await dynamoClient.send(command);

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
