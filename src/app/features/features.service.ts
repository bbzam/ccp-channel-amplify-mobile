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
import { accessKeys } from '../beta-test/access-keys';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly client = generateClient<Schema>();
  private readonly sharedService = inject(SharedService);

  constructor() {}

  async uploadKeys(keys: any): Promise<boolean> {
    try {
      await Promise.all(
        keys.map((key: any) =>
          this.client.models.Keys.create({
            id: key.code,
            isUsed: false,
          })
        )
      );
      this.handleSuccess('Keys uploaded successfully!');
      return true;
    } catch (error) {
      this.handleError(
        'An error occurred while uploading keys. Please try again'
      );
      console.error('Failed to upload keys: ' + error);
      return false;
    }
  }

  async getAllKeys(keyword?: string): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');
      const { data } = await this.client.models.Keys.list();
      if (data) {
        this.sharedService.hideLoader();
        return data;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateKeys(code: string) {
    try {
      // First check if the key is already used
      const existingKey = await this.client.models.Keys.get(
        { id: code },
        {
          authMode: 'iam',
          selectionSet: ['isUsed'],
        }
      );

      if (existingKey.data?.isUsed) {
        this.handleError('This key has already been used');
        throw new Error('This key has already been used');
      }

      // If not used, proceed with the update
      const result = await this.client.models.Keys.update(
        {
          id: code,
          isUsed: true,
        },
        {
          authMode: 'iam',
          selectionSet: ['isUsed'],
        }
      );

      return result;
    } catch (error) {
      console.error('Error updating keys:', error);
      // You can customize the error message based on the error type
      const errorMessage =
        error === 'This key has already been used'
          ? error
          : 'An error occurred while updating the key';
      throw new Error(errorMessage);
    }
  }

  async createUser(data: any): Promise<any> {
    try {
      console.log('data', data);
      const result = await this.client.mutations.addUser(data);
      console.log('result', result);
      if (!result.errors) {
        this.handleSuccess('User created successfully!');
      } else {
        this.handleError(
          'An error occurred while creating user. Please try again'
        );
      }
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(data: any): Promise<any> {
    try {
      console.log('data', data);
      const result = await this.client.mutations.editUser(data);
      console.log('result', result);
      if (!result.errors) {
        this.handleSuccess('User updated successfully!');
      } else {
        this.handleError(
          'An error occurred while updating user. Please try again'
        );
      }
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
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
      console.error('Error disabling user:', error);
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
      console.error('Error enabling user:', error);
      throw error;
    }
  }

  async getAllUsers(role: string): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');
      const result = await this.client.queries.listUsers({
        role: role,
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
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async createContent(contentMetadata: ContentMetadata): Promise<any> {
    try {
      this.sharedService.showLoader('Uploading content...');
      const data = await this.client.models.Content.create({
        title: contentMetadata.title,
        description: contentMetadata.description,
        category: contentMetadata.category,
        subCategory: contentMetadata.subCategory,
        director: contentMetadata.director,
        writer: contentMetadata.writer,
        userType: contentMetadata.userType,
        landscapeImageUrl: contentMetadata.landscapeImageUrl,
        portraitImageUrl: contentMetadata.portraitImageUrl,
        previewVideoUrl: contentMetadata.previewVideoUrl,
        fullVideoUrl: contentMetadata.fullVideoUrl,
        runtime: contentMetadata.runtime,
        resolution: contentMetadata.resolution,
        status: contentMetadata.status,
        publishDate: contentMetadata.publishDate,
      });
      console.log(data);

      if (data) {
        this.sharedService.hideLoader();
      }

      return data;
    } catch (error) {
      this.sharedService.hideLoader();
      console.error('Error saving content metadata:', error);
      throw error; // Re-throw to handle in the component
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

      return result;
    } catch (error) {
      console.error('Error updating contents:', error);
      throw error;
    }
  }

  async updateContent(id: string, contentData: ContentMetadata) {
    try {
      const result = await this.client.models.Content.update({
        id: id,
        ...contentData,
      });

      return result;
    } catch (error) {
      console.error('Error updating contents:', error);
      throw error;
    }
  }

  async getAllContents(
    category: string,
    status: boolean,
    fields?: any[],
    keyword?: string,
    nextToken?: string,
  ): Promise<any> {
    console.log(keyword);

    try {
      this.sharedService.showLoader('Fetching content...');

      const defaultFields = [
        'id',
        'title',
        'description',
        'category',
        'subCategory',
        'director',
        'writer',
        'userType',
        'landscapeImageUrl',
        'portraitImageUrl',
        'previewVideoUrl',
        'fullVideoUrl',
        'runtime',
        'resolution',
        'status',
        'publishDate',
        'createdAt',
        'updatedAt',
      ];

      const { data, nextToken: newNextToken } =
        await this.client.models.Content.list({
          ...(category || status || keyword
            ? {
                selectionSet: fields?.length ? fields : defaultFields,
                limit: 10,
                nextToken,
                filter: {
                  ...(category && {
                    category: {
                      eq: category,
                    },
                  }),
                  ...(status !== undefined &&
                    status !== null && {
                      status: {
                        eq: status,
                      },
                    }),
                  // ...(keyword && {
                  //   content: {
                  //     beginsWith: keyword.toLowerCase(),
                  //   },
                  // }),
                },
              }
            : {
                selectionSet: fields?.length ? fields : defaultFields,
                limit: 10,
                nextToken,
              }),
        });
      if (data && !fields?.length) {
        // Process each content item and update their URLs
        const updatedData = await Promise.all(
          data.map(async (content: any) => {
            const urlLandscape = await this.getFileUrl(
              content.landscapeImageUrl
            );
            const urlPortrait = await this.getFileUrl(content.portraitImageUrl);
            const urlPreviewVideo = await this.getFileUrl(
              content.previewVideoUrl
            );
            const urlFullVideo = await this.getFileUrl(content.fullVideoUrl);

            // Return updated content object with new URLs
            return {
              ...content,
              landscapeImagePresignedUrl: urlLandscape,
              portraitImagePresignedUrl: urlPortrait,
              previewVideoPresignedUrl: urlPreviewVideo,
              fullVideoPresignedUrl: urlFullVideo,
            };
          })
        );

        this.sharedService.hideLoader();

        return { updatedData: updatedData, nextToken: newNextToken };
      }
      this.sharedService.hideLoader();
      return data;
    } catch (error) {
      this.sharedService.hideLoader();
      console.error('Error fetching content metadata:', error);
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
    console.error(error);
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
