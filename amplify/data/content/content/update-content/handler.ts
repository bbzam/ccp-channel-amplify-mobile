import {
  DynamoDBClient,
  UpdateItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const validateCustomFields = async (
  customFields: any,
  dynamoClient: DynamoDBClient
) => {
  if (!customFields) return [];

  try {
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

    const scanCommand = new ScanCommand({
      TableName: process.env.CUSTOMFIELDS_TABLE,
      ProjectionExpression: 'id, fieldName',
    });

    const result = await dynamoClient.send(scanCommand);
    const existingFields = result.Items?.map((item) => unmarshall(item)) || [];
    const validFieldIds = existingFields.map((field) => field.id);

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

  if (!args.id?.trim()) errors.push('Content ID is required');
  if (args.title && !args.title.trim()) errors.push('Title cannot be empty');
  if (args.description && !args.description.trim())
    errors.push('Description cannot be empty');
  if (typeof args.runtime === 'number' && args.runtime <= 0)
    errors.push('Runtime must be a positive number');

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

  if (args.publishDate && isNaN(Date.parse(args.publishDate))) {
    errors.push('Invalid publish date format');
  }

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

  try {
    const { arguments: args } = event;

    const validationErrors = await validateContent(args, dynamoClient);
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors,
      };
    }

    const updateExpression: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    const fieldsToUpdate = [
      'title',
      'description',
      'category',
      'subCategory',
      'director',
      'writer',
      'yearReleased',
      'userType',
      'landscapeImageUrl',
      'portraitImageUrl',
      'previewVideoUrl',
      'fullVideoUrl',
      'runtime',
      'resolution',
      'status',
      'publishDate',
      'customFields',
    ];

    // Only update fields that are provided
    fieldsToUpdate.forEach((field) => {
      if (args[field] !== undefined && args[field] !== null) {
        const attrName = `#${field}`;
        const attrValue = `:${field}`;

        expressionAttributeNames[attrName] = field;

        if (field === 'yearReleased' && args[field]) {
          expressionAttributeValues[attrValue] = String(args[field]);
        } else if (field === 'customFields' && args[field]) {
          expressionAttributeValues[attrValue] = args[field]
            ? (() => {
                let parsedCustomFields;
                if (typeof args[field] === 'string') {
                  parsedCustomFields = JSON.parse(args[field]);
                } else {
                  parsedCustomFields = args[field];
                }

                return parsedCustomFields;
              })()
            : null;
        } else if (typeof args[field] === 'string') {
          expressionAttributeValues[attrValue] = args[field].trim() || null;
        } else {
          expressionAttributeValues[attrValue] = args[field];
        }

        updateExpression.push(`${attrName} = ${attrValue}`);
      }
    });

    // Only proceed if there are fields to update
    if (updateExpression.length === 0) {
      return {
        success: false,
        error: 'No fields to update',
      };
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const command = new UpdateItemCommand({
      TableName: process.env.CONTENT_TABLE,
      Key: marshall({ id: args.id }),
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamoClient.send(command);

    return {
      success: true,
      data: result.Attributes ? unmarshall(result.Attributes) : null,
    };
  } catch (error) {
    console.error('Error updating content:', error);
    return {
      success: false,
      error: error,
    };
  }
};
