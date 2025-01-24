import { inject, Injectable } from '@angular/core';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContentMetadata } from './features.model';
import { post } from 'aws-amplify/api';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService {
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  constructor() {}

  async createContent(contentMetadata: ContentMetadata): Promise<any> {
    try {
      const restOperation = post({
        apiName: 'ContentAPI', //  API name configured in Amplify
        path: '/content', //  API endpoint path
        options: {
          body: JSON.stringify(contentMetadata),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      });

      const response = await restOperation.response;
      const data = await response.body.json();

      return data;
    } catch (error) {
      console.error('Error saving content metadata:', error);
      throw error; // Re-throw to handle in the component
    }
  }

  private handleError(error: any) {
    console.error(error);
    return this.dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: String(error) },
      })
      .afterClosed();
  }
}
