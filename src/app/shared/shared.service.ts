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

  async getFeaturedAll(category: string): Promise<any> {
    try {
      this.showLoader('Fetching content...');
      const { data } = await this.client.models.FeaturedAll.list({
        filter: {
          ...(category && {
            category: {
              contains: category,
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

  async getAllTags(keyword?: string, isVisible?: boolean): Promise<any> {
    try {
      const { data } = await this.client.models.tags.list({
        filter: {
          ...(keyword && {
            tag: {
              contains: keyword,
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
