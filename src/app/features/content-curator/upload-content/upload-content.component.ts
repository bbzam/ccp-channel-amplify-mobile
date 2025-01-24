import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { uploadData } from 'aws-amplify/storage';
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
      const landscapeImageKey = `images/landscape/${Date.now()}-${
        this.inputLandscapeImage.name
      }`;
      const landscapeUpload = await uploadData({
        key: landscapeImageKey,
        data: this.inputLandscapeImage,
        options: {
          contentType: this.inputLandscapeImage.type,
        },
      }).result;

      // Upload portrait image
      const portraitImageKey = `images/portrait/${Date.now()}-${
        this.inputPortraitImage.name
      }`;
      const portraitUpload = await uploadData({
        key: portraitImageKey,
        data: this.inputPortraitImage,
        options: {
          contentType: this.inputPortraitImage.type,
        },
      }).result;

      // Upload preview video
      const previewVideoKey = `videos/preview/${Date.now()}-${
        this.inputPreviewVideo.name
      }`;
      const previewUpload = await uploadData({
        key: previewVideoKey,
        data: this.inputPreviewVideo,
        options: {
          contentType: this.inputPreviewVideo.type,
        },
      }).result;

      // Upload full video
      const fullVideoKey = `videos/full/${Date.now()}-${
        this.inputFullVideo.name
      }`;
      const fullVideoUpload = await uploadData({
        key: fullVideoKey,
        data: this.inputFullVideo,
        options: {
          contentType: this.inputFullVideo.type,
        },
      }).result;

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
        createdAt: new Date().toISOString(),
      };

      await this.featureService.createContent(contentMetadata);

      this.resetForm();
    } catch (error) {
      console.error('Error publishing content:', error);
    } finally {
      this.isLoading = false;
    }
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
