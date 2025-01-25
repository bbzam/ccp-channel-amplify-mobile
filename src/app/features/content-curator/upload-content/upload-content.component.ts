import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { isCancelError, uploadData } from 'aws-amplify/storage';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-upload-content',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatButtonModule,
  ],
  templateUrl: './upload-content.component.html',
  styleUrl: './upload-content.component.css',
})
export class UploadContentComponent {
  inputTitle!: string;
  inputDescription!: string;
  inputCategory!: string;
  inputSubCategory!: string;
  inputUserType!: string;
  inputLandscapeImage!: any;
  inputPortraitImage!: any;
  inputPreviewVideo!: any;
  inputFullVideo!: any;
  isLoading: boolean = false;

  uploadFullVideo!: any;

  readonly dialogRef = inject(MatDialogRef<UploadContentComponent>);
  readonly featureService = inject(FeaturesService);

  schedulePublish() {}

  cancel() {
    this.dialogRef.close();
  }

  async publishContent() {
    try {
      this.isLoading = true;

      // Upload landscape image
      const landscapeImageKey = `landscape-images/${Date.now()}-${
        this.inputLandscapeImage.name
      }`;

      try {
        console.log('inputLandscapeImage data:', this.inputLandscapeImage);

        await uploadData({
          data: this.inputLandscapeImage,
          path: landscapeImageKey,
        });
      } catch (e) {
        console.log('error', e);
      }

      // Upload portrait image
      const portraitImageKey = `portrait-images/${Date.now()}-${
        this.inputPortraitImage.name
      }`;

      try {
        await uploadData({
          data: this.inputPortraitImage,
          path: portraitImageKey,
        });
      } catch (e) {
        console.log('error', e);
      }

      // Upload preview video
      const previewVideoKey = `preview-videos/${Date.now()}-${
        this.inputPreviewVideo.name
      }`;

      try {
        await uploadData({
          data: this.inputPreviewVideo,
          path: previewVideoKey,
        });
      } catch (e) {
        console.log('error', e);
      }

      // Upload full video
      const fullVideoKey = `full-videos/${Date.now()}-${
        this.inputFullVideo.name
      }`;

      const uploadFullVideo = uploadData({
        data: this.inputFullVideo,
        path: fullVideoKey,
      });
      // uploadFullVideo.pause();
      // uploadFullVideo.resume();
      // uploadFullVideo.cancel();

      try {
        const result = await uploadFullVideo.result;
        // return {
        //   key: fullVideoKey,
        //   result,
        // };
        console.log(result);
      } catch (e) {
        if (isCancelError(e)) {
          console.log('isCancelError', e);
        } else {
          console.log('error', e);
        }
      }

      // Create content metadata object
      const contentMetadata = {
        title: this.inputTitle,
        description: this.inputDescription,
        category: this.inputCategory,
        subCategory: this.inputSubCategory,
        userType: this.inputUserType,
        landscapeImageUrl: landscapeImageKey,
        portraitImageUrl: portraitImageKey,
        previewVideoUrl: previewVideoKey,
        fullVideoUrl: fullVideoKey,
        // createdAt: new Date().toISOString(),
      };

      await this.featureService.createContent(contentMetadata).then(
        async (result) => {
          console.log(result.data);

          result.data
            ? this.featureService.handleSuccess('Successfully Uploaded!')
            : this.featureService.handleError(
                'Uploading Error, Please try again.'
              );
          this.dialogRef.close();
        },
        (error) => {
          this.isLoading = false;
          this.featureService.handleError(error);
        }
      );
    } catch (error) {
      console.error('Error publishing content:', error);
    } finally {
      this.isLoading = false;
    }
    return;
  }

  // File selection handlers
  onLandscapeImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputLandscapeImage = file;
    }
  }

  onPortraitImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputPortraitImage = file;
    }
  }

  onPreviewVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputPreviewVideo = file;
    }
  }

  onFullVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputFullVideo = file;
    }
  }

  private resetForm() {
    this.inputTitle = '';
    this.inputDescription = '';
    this.inputCategory = '';
    this.inputSubCategory = '';
    this.inputUserType = '';
    this.inputLandscapeImage = null;
    this.inputPortraitImage = null;
    this.inputPreviewVideo = null;
    this.inputFullVideo = null;

    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input: any) => {
      input.value = '';
    });
  }
}
