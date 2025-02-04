import { inject, Injectable } from '@angular/core';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContentMetadata } from './features.model';
import { generateClient, post } from 'aws-amplify/api';
import { SuccessMessageDialogComponent } from '../shared/dialogs/success-message-dialog/success-message-dialog.component';
import { environment } from '../../environments/environment.development';
import { Schema } from '../../../amplify/data/resource';
import { getUrl } from 'aws-amplify/storage';
import { SharedService } from '../shared/shared.service';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  UPLOADCONTENT_URL = environment.APIURL + '/';

  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly client = generateClient<Schema>();
  readonly sharedService = inject(SharedService);

  constructor() {}

  // uploadKeys() {
  //   const keys = accessKeys;
  //   keys.forEach((key) => {
  //     console.log(key)
  //     console.log({
  //       code: key.code,
  //       isUsed: key.isUsed
  //     })
  //     this.client.models.AccessKey.create({
  //       code: key.code,
  //       isUsed: key.isUsed
  //     });
  //   });
  // }

  // async uploadKeys() {
  //   try {
  //     const keys = accessKeys;

  //     // Add logging to debug
  //     console.log('Client:', this.client);
  //     console.log('Models:', this.client.models);
  //     console.log('Models:', this.client.models.AccessKey);

  //     // Check if keys exist
  //     if (!Array.isArray(keys) || keys.length === 0) {
  //       console.error('No keys to upload');
  //       return;
  //     }

  //     const results = await Promise.all(
  //       keys.map(async (entry) => {
  //         try {
  //           // Ensure entry has the correct shape
  //           const keyData = {
  //             code: entry.code,
  //             isUsed: entry.isUsed ?? false,
  //             // Add any other required fields
  //           };

  //           const result = await this.client.models.AccessKey.create(keyData);
  //           console.log('Created key:', result);
  //           return result;
  //         } catch (err) {
  //           console.error('Error creating individual key:', err);
  //           return null;
  //         }
  //       })
  //     );

  //     const successfulUploads = results.filter(Boolean);
  //     console.log(
  //       `Successfully uploaded ${successfulUploads.length} of ${keys.length} keys`
  //     );

  //     return successfulUploads;
  //   } catch (error) {
  //     console.error('Unexpected error during bulk upload:', error);
  //     throw error;
  //   }
  // }

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

  async getAllContents(): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');
      const { data, errors } = await this.client.models.Content.list();
      if (data) {
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
              landscapeImageUrl: urlLandscape,
              portraitImageUrl: urlPortrait,
              previewVideoUrl: urlPreviewVideo,
              fullVideoUrl: urlFullVideo,
            };
          })
        );

        this.sharedService.hideLoader();

        return updatedData;
      }
      return [];
    } catch (error) {
      this.sharedService.hideLoader();
      console.error('Error fetching content metadata:', error);
      throw error; // Re-throw to handle in the component
    }
  }

  async filterContent(category: string): Promise<any> {
    try {
      this.sharedService.showLoader('Fetching content...');
      const { data, errors } = await this.client.models.Content.list({
        filter: {
          category: {
            eq: category,
          },
        },
      });
      if (data) {
        console.log('Original data:', data);

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
              landscapeImageUrl: urlLandscape,
              portraitImageUrl: urlPortrait,
              previewVideoUrl: urlPreviewVideo,
              fullVideoUrl: urlFullVideo,
            };
          })
        );

        this.sharedService.hideLoader();

        return updatedData;
      }
      return [];
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
