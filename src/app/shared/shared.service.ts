import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { ErrorMessageDialogComponent } from './dialogs/error-message-dialog/error-message-dialog.component';
import { SuccessMessageDialogComponent } from './dialogs/success-message-dialog/success-message-dialog.component';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';

interface LoaderState {
  show: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private readonly client = generateClient<Schema>();
  private readonly dialog = inject(MatDialog);
  private isLoadingSubject = new BehaviorSubject<LoaderState>({ show: false });
  isLoading$: Observable<LoaderState> = this.isLoadingSubject.asObservable();

  showLoader(message?: string): void {
    this.isLoadingSubject.next({ show: true, message });
  }

  hideLoader(): void {
    this.isLoadingSubject.next({ show: false });
  }

  async getStatistics(): Promise<any> {
    try {
      this.showLoader('Fetching content...');
      const stats = await this.client.queries.statistics({});

      if (stats && stats.data) {
        this.hideLoader();

        // Check if data is a string before parsing
        const parsedData =
          typeof stats.data === 'string' ? JSON.parse(stats.data) : stats.data;

        // if (parsedData.success && parsedData.data) {
        //   // Map the viewCount array to the requested format
        //   const formattedViewCount = parsedData.data.map((item: any) => ({
        //     title: item.title?.S,
        //     viewCount: item.viewCount?.N,
        //   }));

        //   return formattedViewCount;
        // }
        return parsedData;
      }

      this.hideLoader();
      return stats;
    } catch (error) {
      this.hideLoader();
      this.handleError(error);
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async addCustomField(data: any) {
    try {
      const result = await this.client.models.customFields.create(data);
      if (!result.errors) {
        this.handleSuccess('Custom field added successfully!');
      } else {
        this.handleError(
          'An error occurred while adding a custom field. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error adding a custom field:', error);
      throw error;
    }
  }

  async getFeaturedAll(category: string): Promise<any> {
    try {
      this.showLoader('Fetching content...');
      const { data } = await this.client.models.FeaturedAll.list({
        filter: {
          ...(category && {
            category: {
              eq: category,
            },
          }),
        },
      });
      if (data) {
        this.hideLoader();
        return data;
      }
    } catch (error) {
      this.handleError(error);
      this.hideLoader();
      console.error('Error fetching featured content:', error);
      throw error;
    }
  }

  async addFeaturedAll(data: any) {
    try {
      const result = await this.client.models.FeaturedAll.create(data);
      if (!result.errors) {
        this.handleSuccess('Contents added to Featured successfully!');
      } else {
        this.handleError(
          'An error occurred while adding featured contents. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error adding featured content:', error);
      throw error;
    }
  }

  async updateFeaturedAll(data: any) {
    try {
      const result = await this.client.models.FeaturedAll.update(data);
      if (!result.errors) {
        this.handleSuccess('Featured updated successfully!');
      } else {
        this.handleError(
          'An error occurred while updating featured. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error updating featured content:', error);
      throw error;
    }
  }

  async addTag(data: any) {
    try {
      const result = await this.client.models.tags.create(data);
      if (!result.errors) {
        this.handleSuccess('Tag added successfully!');
      } else {
        this.handleError(
          'An error occurred while adding a tag. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error adding a tag:', error);
      throw error;
    }
  }

  async updateTag(data: any) {
    try {
      const result = await this.client.models.tags.update(data);
      if (!result.errors) {
        this.handleSuccess('Updated successfully!');
      } else {
        this.handleError('An error occurred while updating. Please try again');
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error updating:', error);
      throw error;
    }
  }

  async updateCustomField(data: any) {
    try {
      const result = await this.client.models.customFields.update(data);
      if (!result.errors) {
        this.handleSuccess('Custom field updated successfully!');
      } else {
        this.handleError(
          'An error occurred while updating custom field. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error updating custom field:', error);
      throw error;
    }
  }

  async deleteTag(id: string) {
    try {
      const result = await this.client.models.tags.delete({ id });
      if (!result.errors) {
        this.handleSuccess('Tag deleted successfully!');
      } else {
        this.handleError(
          'An error occurred while deleting the tag. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error deleting tag:', error);
      throw error;
    }
  }

  async getAllCustomFields(keyword?: string): Promise<any> {
    try {
      const { data } = await this.client.models.customFields.list({
        filter: {
          ...(keyword && {
            fieldName: {
              contains: keyword,
            },
          }),
        },
      });
      console.log('Custom fields:', data);
      if (data) {
        return data;
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error fetching custom fields:', error);
      throw error;
    }
  }

  async deleteCustomField(id: string) {
    try {
      const result = await this.client.models.customFields.delete({
        id: id,
      });
      if (!result.errors) {
        this.handleSuccess('Custom field deleted successfully!');
      } else {
        this.handleError(
          'An error occurred while deleting the custom field. Please try again'
        );
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error deleting custom field:', error);
      throw error;
    }
  }

  async getAllTags(id?: string, isVisible?: boolean): Promise<any> {
    try {
      const { data } = await this.client.models.tags.list({
        filter: {
          ...(id && {
            id: {
              contains: id,
            },
          }),
          ...(isVisible !== undefined && {
            isVisible: {
              eq: isVisible,
            },
          }),
        },
      });
      if (data) {
        return data;
      }
    } catch (error) {
      this.handleError(error);
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  async createContentToUser(data: any) {
    try {
      const result = await this.client.mutations.createContentToUserFunction(
        data
      );

      if (result && result.data) {
        return result.data;
      }

      throw new Error('Failed to create content to user relationship');
    } catch (error) {
      console.error('Error creating content to user relationship:', error);
      throw error;
    }
  }

  async getContentToUser(contentId: string): Promise<any> {
    try {
      const result = await this.client.queries.getContentToUserFunction({
        contentId: contentId,
      });

      if (result && result.data) {
        return typeof result.data === 'string'
          ? JSON.parse(result.data)
          : result.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching content to user relationship:', error);
      throw error;
    }
  }

  async updateContentToUser(data: any) {
    try {
      // const result = await this.client.mutations.updateContentToUser({
      //   data: data,
      // });
      // if (!result || !result.data) {
      //   throw new Error('Failed to update content to user relationship');
      // }
      // return result.data;
    } catch (error) {
      console.error('Error updating content to user relationship:', error);
      throw error;
    }
  }

  async getContinueWatch(): Promise<any> {
    try {
      const result = await this.client.queries.getContinueWatchFunction({});
      if (result?.data) {
        const parsedData =
          typeof result.data === 'string'
            ? JSON.parse(result.data)
            : result.data;
        return parsedData.success ? parsedData.data : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      throw error;
    }
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
