import { inject, Injectable } from '@angular/core';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContentMetadata } from './features.model';
import { generateClient, post } from 'aws-amplify/api';
import { SuccessMessageDialogComponent } from '../shared/dialogs/success-message-dialog/success-message-dialog.component';
import { Schema } from '../../../amplify/data/resource';
import { getUrl } from 'aws-amplify/storage';
import { SharedService } from '../shared/shared.service';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly client = generateClient<Schema>();
  private readonly sharedService = inject(SharedService);
  private contentCache: Map<string, any[]> = new Map();

  constructor() {}

  async getCurrentUser(email: string): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');
      const currentUser = await this.client.queries.listUser({
        email: email,
      });

      // Check if we have data in the expected format
      if (
        currentUser &&
        currentUser.data &&
        typeof currentUser.data === 'string'
      ) {
        // Parse the data string
        let parsedData = JSON.parse(currentUser.data);

        // If the parsed result is still a string (which happens with nested JSON strings)
        if (typeof parsedData === 'string') {
          parsedData = JSON.parse(parsedData);
        }

        // Format user attributes into a more accessible structure if they exist
        if (parsedData && parsedData.UserAttributes) {
          // Create an object to store user attributes
          const userAttributes = parsedData.UserAttributes.reduce(
            (acc: any, attr: any) => {
              acc[attr.Name] = attr.Value;
              return acc;
            },
            {}
          );

          // Create formatted user object similar to getAllUsers
          const formattedUser = {
            id: parsedData.Username,
            email: userAttributes.email,
            given_name: userAttributes.given_name,
            family_name: userAttributes.family_name,
            birthdate: userAttributes.birthdate,
            email_verified: userAttributes.email_verified,
            user_status: parsedData.UserStatus,
            enabled: parsedData.Enabled,
            created_at: parsedData.UserCreateDate,
            last_modified: parsedData.UserLastModifiedDate,
          };
          this.sharedService.hideLoader();

          return formattedUser;
        }
        this.sharedService.hideLoader();

        return parsedData;
      }

      return currentUser;
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError(error);
      throw error;
    }
  }

  async createUser(data: any): Promise<any> {
    try {
      const result = await this.client.mutations.addUser(data);
      if (!result.errors) {
        this.handleSuccess('User created successfully!');
      } else {
        this.handleError(
          'An error occurred while creating user. Please try again'
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(data: any): Promise<any> {
    try {
      const result = await this.client.mutations.editUser(data);
      if (!result.errors) {
        this.handleSuccess('User updated successfully!');
      } else {
        this.handleError(
          'An error occurred while updating user. Please try again'
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async disableUser(data: any): Promise<any> {
    try {
      const result = await this.client.mutations.disableUser(data);
      if (!result.errors) {
        this.handleSuccess('User disabled successfully!');
      } else {
        this.handleError(
          'An error occurred while disabling user. Please try again'
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async enableUser(email: any): Promise<any> {
    try {
      const result = await this.client.mutations.enableUser(email);
      if (!result.errors) {
        this.handleSuccess('User enabled successfully!');
      } else {
        this.handleError(
          'An error occurred while enabling user. Please try again'
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(
    role: string,
    limit?: string,
    keyword?: string
  ): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');

      const result = await this.client.queries.listUsers({
        role: role,
        limit: '1000',
        keyword: keyword,
      });
      if (result.data && typeof result.data === 'string') {
        const parsedData = JSON.parse(result.data);

        // Transform the data into a JSON format
        const formattedUsers = parsedData.Users.map((user: any) => {
          // Create an object to store user attributes
          const userAttributes = user.Attributes.reduce(
            (acc: any, attr: any) => {
              acc[attr.Name] = attr.Value;
              return acc;
            },
            {}
          );

          return {
            id: user.Username,
            email: userAttributes.email,
            given_name: userAttributes.given_name,
            family_name: userAttributes.family_name,
            birthdate: userAttributes.birthdate,
            email_verified: userAttributes.email_verified,
            subscriptionType: user.subscriptionType,
            'custom:paidUntil': userAttributes['custom:paidUntil'],
            UserStatus: user.UserStatus,
            Enabled: user.Enabled,
            createdAt: user.UserCreateDate,
            lastModified: user.UserLastModifiedDate,
          };
        });

        this.sharedService.hideLoader();
        return formattedUsers;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async createContent(contentMetadata: ContentMetadata): Promise<any> {
    try {
      this.sharedService.showLoader('Uploading content...');

      const result = await this.client.mutations.createContentFunction(
        contentMetadata
      );

      // Parse the result if it's a string
      const parsedResult =
        typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

      if (parsedResult?.success) {
        this.clearContentCache();
        this.sharedService.hideLoader();
        return parsedResult;
      } else {
        this.sharedService.hideLoader();
        this.handleError(
          'An error occurred while creating content. Please try again'
        );
      }
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError(
        'An error occurred while creating content. Please try again'
      );
      throw error;
    }
  }

  async updateContent(id: string, contentData: ContentMetadata) {
    try {
      const result = await this.client.mutations.updateContentFunction({
        id: id,
        ...contentData,
      });

      // Parse the result if it's a string
      const parsedResult =
        typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

      if (parsedResult?.success) {
        this.clearContentCache();
        this.sharedService.hideLoader();
        return parsedResult;
      } else {
        const errorMessage =
          parsedResult?.errors?.join(', ') || 'Content update failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      throw error;
    }
  }

  async publishAndScheduleContent(id: string, status: boolean) {
    try {
      const result = await this.client.models.Content.update(
        {
          id: id,
          status: status,
        },
        {
          selectionSet: ['status'],
        }
      );

      this.clearContentCache();
      return result;
    } catch (error) {
      throw error;
    }
  }

  private clearContentCache(
    category?: string,
    status?: boolean,
    keyword?: string
  ): void {
    if (
      category !== undefined ||
      status !== undefined ||
      keyword !== undefined
    ) {
      // Clear specific cache entry if parameters are provided
      const cacheKey = `${category || ''}-${
        status === undefined ? '' : status
      }-${keyword || ''}`;
      this.contentCache.delete(cacheKey);
    } else {
      // Clear the entire cache if no parameters are provided
      this.contentCache.clear();
    }
  }

  async getAllContents(
    category: string,
    status: boolean,
    fields?: any[],
    keyword?: string,
    filterBy?: {}
  ): Promise<any> {
    const cacheKey = `${category}-${status}-${keyword || ''}-${JSON.stringify(
      filterBy || {}
    )}`;

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    try {
      this.sharedService.showLoader('Fetching content...');

      const result = await this.client.queries.getContentFunction({
        category,
        status,
        keyword,
        fields,
        filterBy,
      });

      if (result.data && typeof result.data === 'string') {
        const parsedData = JSON.parse(result.data);
        this.contentCache.set(cacheKey, parsedData);
        this.sharedService.hideLoader();
        return parsedData;
      }

      this.sharedService.hideLoader();

      return result.data;
    } catch (error) {
      this.sharedService.hideLoader();
      throw error;
    }
  }

  async getUserFavorites(): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching favorites...');
      const result = await this.client.queries.getUserFavoritesFunction({});
      this.sharedService.hideLoader();

      if (result.data && typeof result.data === 'string') {
        const parsedData = JSON.parse(result.data);
        return parsedData.data || [];
      }

      return result.data || [];
    } catch (error) {
      this.sharedService.hideLoader();
      throw error;
    }
  }

  async createPayment(rate: string, ProcId: string): Promise<any> {
    try {
      this.sharedService.showLoader('Redirecting to Dragonpay...');
      const result = await this.client.queries.createPayment({
        rate: rate,
        ProcId: ProcId,
        email: String(sessionStorage.getItem('email')),
      });

      console.log('result', result);

      if (result.data && typeof result.data === 'string') {
        const parsedData = JSON.parse(result.data);
        this.sharedService.hideLoader();
        return parsedData.data || [];
      }

      return result.data;
    } catch (error) {
      this.sharedService.hideLoader();
      this.handleError('Error creating a payment');
      throw error;
    }
  }

  async toggleFavorite(contentId: string, isFavorite: boolean): Promise<any> {
    try {
      const result = await this.client.mutations.createContentToUserFunction({
        contentId: contentId,
        isFavorite: isFavorite,
      });

      if (result.data && typeof result.data === 'string') {
        const parsedData = JSON.parse(result.data);

        return parsedData;
      }

      return result;
    } catch (error) {
      this.handleError('Error updating favorites');
      throw error;
    }
  }

  async getFileUrl(path: any) {
    const linkToStorageFile = await getUrl({
      path: path,
    });

    return String(linkToStorageFile.url);
  }

  public handleError(error: any) {
    return this.dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: String(error) },
      })
      .afterClosed();
  }

  public handleSuccess(message: string) {
    return this.dialog
      .open(SuccessMessageDialogComponent, {
        data: { message: String(message) },
      })
      .afterClosed();
  }
}
