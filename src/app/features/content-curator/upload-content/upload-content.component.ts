import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { isCancelError, uploadData } from 'aws-amplify/storage';
import { FeaturesService } from '../../features.service';
import { Location } from '@angular/common';
import { distinctUntilChanged, firstValueFrom, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { errorMessages } from '../../../shared/utils/errorMessages';
import { InputDateComponent } from '../../../shared/component/input-date/input-date.component';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  quality: string;
  size: number;
  type: string;
}

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
  inputDirector!: string;
  inputWriter!: string;
  inputUserType!: string;
  inputLandscapeImage!: any;
  inputPortraitImage!: any;
  inputPreviewVideo!: any;
  inputFullVideo!: any;
  date!: string;
  videoMetadata: VideoMetadata | null = null;
  uploadFullVideo!: any;
  landscapeFileURL!: string;
  portraitFileURL!: string;
  previewFileURL!: string;
  fullFileURL!: string;
  uploadForm!: FormGroup;

  readonly isLoading = signal(false);
  readonly isScheduling = signal(false);
  readonly dialogRef = inject(MatDialogRef<UploadContentComponent>);
  readonly featureService = inject(FeaturesService);
  readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  readonly dialog = inject(MatDialog);

  // Error message signals
  titleErrorMessage = signal('');
  descriptionErrorMessage = signal('');
  categoryErrorMessage = signal('');
  subCategoryErrorMessage = signal('');
  directorErrorMessage = signal('');
  writerErrorMessage = signal('');
  userTypeErrorMessage = signal('');
  landscapeErrorMessage = signal('');
  portraitErrorMessage = signal('');
  previewErrorMessage = signal('');
  fullErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.uploadForm.valid,
    isDirty: this.uploadForm.dirty,
    isPristine: this.uploadForm.pristine,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
  }

  private createForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      subcategory: [],
      director: ['', [Validators.required]],
      writer: [],
      usertype: ['', [Validators.required]],
      landscapeimage: ['', [Validators.required]],
      portraitimage: ['', [Validators.required]],
      previewvideo: ['', [Validators.required]],
      fullvideo: ['', [Validators.required]],
    });
  }

  private setupValidationSubscriptions(): void {
    const controls = [
      'title',
      'description',
      'category',
      'subcategory',
      'director',
      'writer',
      'usertype',
      'landscapeimage',
      'portraitimage',
      'previewvideo',
      'fullvideo',
    ];

    controls.forEach((controlName) => {
      const control = this.uploadForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.uploadForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      title: this.titleErrorMessage,
      description: this.descriptionErrorMessage,
      category: this.categoryErrorMessage,
      subcategory: this.subCategoryErrorMessage,
      director: this.directorErrorMessage,
      writer: this.writerErrorMessage,
      usertype: this.userTypeErrorMessage,
      landscapeimage: this.landscapeErrorMessage,
      portraitimage: this.portraitErrorMessage,
      previewvideo: this.previewErrorMessage,
      fullvideo: this.fullErrorMessage,
    };

    const signal = errorSignalMap[controlName];

    if (control.hasError('required')) {
      signal.set(errorMessages.REQUIRED);
    } else if (control.hasError('notMax100')) {
      signal.set(errorMessages.MAX100CHARACTERS);
    } else if (control.hasError('disallowedCharacters')) {
      signal.set(errorMessages.DISALLOWEDCHARACTERS);
    } else if (control.hasError('invalidEmailAddress')) {
      signal.set(errorMessages.INVALIDEMAIL);
    } else if (control.hasError('notNumeric')) {
      signal.set(errorMessages.ONLYNUMERICAL);
    } else if (control.hasError('notMax3')) {
      signal.set(errorMessages.MAX3NUMERIC);
    } else if (control.hasError('noUppercase')) {
      signal.set(errorMessages.HASUPPERCASE);
    } else if (control.hasError('noLowercase')) {
      signal.set(errorMessages.HASLOWERCASE);
    } else if (control.hasError('noSpecialCharacter')) {
      signal.set(errorMessages.HASSPECIALCHARACTER);
    } else if (control.hasError('noNumber')) {
      signal.set(errorMessages.HASNUMBER);
    } else if (control.hasError('noMinimumLength')) {
      signal.set(errorMessages.PASSWORDMINLENGTH);
    } else if (control.hasError('isNotMatch')) {
      signal.set(errorMessages.PASSWORDNOTMATCH);
    } else {
      signal.set('');
    }
  }

  schedulePublish() {}

  backButton() {
    // this.location.back();
    this.dialogRef.close();
  }

  async publishContent(isForPublish: boolean) {
    try {
      if (!isForPublish) {
        const dialogResult = await firstValueFrom(
          this.dialog.open(InputDateComponent).afterClosed()
        );

        this.date = dialogResult;

        if (!this.date) {
          return;
        }
      }

      isForPublish ? this.isLoading.set(true) : this.isScheduling.set(true);

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

      const formData = this.uploadForm.value;
      // Create content metadata object
      const contentMetadata = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subcategory,
        director: formData.director,
        writer: formData.writer,
        userType: formData.usertype,
        landscapeImageUrl: landscapeImageKey,
        portraitImageUrl: portraitImageKey,
        previewVideoUrl: previewVideoKey,
        fullVideoUrl: fullVideoKey,
        runtime: this.videoMetadata?.duration,
        resolution: this.videoMetadata?.quality,
        status: isForPublish,
        publishDate: this.date,
      };

      console.log(contentMetadata);

      await this.featureService.createContent(contentMetadata).then(
        async (result) => {
          console.log(result.data);

          result.data
            ? this.featureService.handleSuccess(
                isForPublish
                  ? 'Content Published Successfully!'
                  : 'Content Scheduled Successfully!'
              )
            : this.featureService.handleError(
                'Uploading Error, Please try again.'
              );
          this.dialogRef.close();
        },
        (error) => {
          isForPublish
            ? this.isLoading.set(false)
            : this.isScheduling.set(false);
          this.featureService.handleError(error);
        }
      );
    } catch (error) {
      console.error('Error publishing content:', error);
    } finally {
      isForPublish ? this.isLoading.set(false) : this.isScheduling.set(false);
    }
    return;
  }

  // File selection handlers
  onLandscapeImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputLandscapeImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.landscapeFileURL = String(reader.result);
      };

      reader.readAsDataURL(file);
    }
  }

  onPortraitImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputPortraitImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.portraitFileURL = String(reader.result);
      };

      reader.readAsDataURL(file);
    }
  }

  onPreviewVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputPreviewVideo = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewFileURL = String(reader.result);
      };

      reader.readAsDataURL(file);
    }
  }

  onFullVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.inputFullVideo = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.fullFileURL = String(reader.result);
      };

      reader.readAsDataURL(file);

      const video = document.createElement('video');
      video.preload = 'metadata';

      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        // Determine video quality based on resolution
        const quality = this.getVideoQuality(width, height);

        console.log('Video Duration:', duration, 'seconds');
        console.log('Video Quality:', quality);

        this.videoMetadata = {
          duration,
          width,
          height,
          quality, // Add quality to metadata
          size: file.size,
          type: file.type,
        };

        URL.revokeObjectURL(url);
      };
    }
  }

  // Add this helper method to determine video quality
  private getVideoQuality(width: number, height: number): string {
    const resolution = Math.max(width, height);

    if (resolution >= 7680) return '8K';
    if (resolution >= 3840) return '4K';
    if (resolution >= 1920) return '1080p';
    return '720p';
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
