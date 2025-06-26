import { defineFunction } from '@aws-amplify/backend';
import { config } from '../../../../config';

export const getUserFavoritesFunction = defineFunction({
  name: 'get-userFavorites',
  environment: {
    REGION: config.REGION,
    CONTENTTOUSER_TABLE: config.CONTENTTOUSER_TABLE,
    CONTENT_TABLE: config.CONTENT_TABLE,
  },
});
