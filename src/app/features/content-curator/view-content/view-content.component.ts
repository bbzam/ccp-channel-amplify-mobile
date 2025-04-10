import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { computed, inject, signal } from '@angular/core';
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
import { isCancelError, remove, uploadData } from 'aws-amplify/storage';
import { FeaturesService } from '../../features.service';
import { Location } from '@angular/common';
import { distinctUntilChanged, firstValueFrom, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { errorMessages } from '../../../shared/utils/errorMessages';
import { InputDateComponent } from '../../../shared/component/input-date/input-date.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileValidator } from '../../../shared/utils/file-validation';
import { ConfirmationDialogComponent } from '../../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  quality: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-view-content',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './view-content.component.html',
  styleUrl: './view-content.component.css',
})
export class ViewContentComponent {
  @Input() content: any;
  id!: string;
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
  landscapeFilePresignedURL!: string;
  portraitFilePresignedURL!: string;
  previewFilePresignedURL!: string;
  fullFilePresignedURL!: string;
  landscapeImageKey!: string;
  portraitImageKey!: string;
  previewVideoKey!: string;
  fullVideoKey!: string;
  uploadForm!: FormGroup;
  landscapeUploadProgress: number = 0;
  portraitUploadProgress: number = 0;
  previewUploadProgress: number = 0;
  fullUploadProgress: number = 0;
  isPublished!: boolean;
  originalValues: any;
  uploadProgress: { [key: string]: number } = {};
  uploadTasks: { [key: string]: any } = {};
  isPaused: { [key: string]: boolean } = {
    landscape: false,
    portrait: false,
    preview: false,
    full: false,
  };

  readonly isEditing = signal(false);
  readonly isPublishing = signal(false);
  readonly isScheduling = signal(false);
  readonly isUpdating = signal(false);
  readonly buttonDisabled = signal(true);
  readonly dialogRef = inject(MatDialogRef<ViewContentComponent>);
  readonly featureService = inject(FeaturesService);
  readonly location = inject(Location);
  readonly fb = inject(FormBuilder);
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.content = data;
    this.setDefaultValue(data);
    console.log(this.content);
    this.createForm();
    this.setupValidationSubscriptions();
  }

  private setDefaultValue(data: any) {
    this.id = data.id;
    this.inputTitle = data.title;
    this.inputDescription = data.description;
    this.inputCategory = data.category;
    this.inputSubCategory = data.subcategory;
    this.inputDirector = data.director;
    this.inputWriter = data.writer;
    this.inputUserType = data.userType;
    this.landscapeFileURL = data.landscapeImageUrl;
    this.portraitFileURL = data.portraitImageUrl;
    this.previewFileURL = data.previewVideoUrl;
    this.fullFileURL = data.fullVideoUrl;
    this.isPublished = data.status;

    this.landscapeFilePresignedURL = data.landscapeImagePresignedUrl;
    this.portraitFilePresignedURL = data.portraitImagePresignedUrl;
    this.previewFilePresignedURL = data.previewVideoPresignedUrl;
    this.fullFilePresignedURL = data.fullVideoPresignedUrl;

    // Store original values
    this.originalValues = {
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      director: data.director,
      writer: data.writer,
      usertype: data.userType,
      landscapeimage: data.landscapeImageUrl,
      portraitimage: data.portraitImageUrl,
      previewvideo: data.previewVideoUrl,
      fullvideo: data.fullVideoUrl,
    };
  }

  getChangedFields(): any {
    const currentValues = this.uploadForm.getRawValue();
    const changes: any = {};

    const excludeFields = [
      'landscapeimage',
      'portraitimage',
      'previewvideo',
      'fullvideo',
    ];

    // Check form field changes
    Object.keys(this.originalValues).forEach((key) => {
      // Skip file input fields
      if (excludeFields.includes(key)) {
        return;
      }

      if (this.originalValues[key] !== currentValues[key]) {
        changes[key] = currentValues[key];
      }
    });

    // Check file changes
    if (this.landscapeImageKey)
      changes.landscapeImageUrl = this.landscapeImageKey;
    if (this.portraitImageKey) changes.portraitImageUrl = this.portraitImageKey;
    if (this.previewVideoKey) changes.previewVideoUrl = this.previewVideoKey;
    if (this.fullVideoKey) {
      changes.fullVideoUrl = this.fullVideoKey;
      changes.runtime = this.videoMetadata?.duration;
      changes.resolution = this.videoMetadata?.quality;
    }

    return changes;
  }

  private createForm(): void {
    this.uploadForm = this.fb.group({
      title: [
        { value: this.inputTitle, disabled: !this.isEditing() },
        [Validators.required],
      ],
      description: [
        { value: this.inputDescription, disabled: !this.isEditing() },
        [Validators.required],
      ],
      category: [
        { value: this.inputCategory, disabled: !this.isEditing() },
        [Validators.required],
      ],
      subcategory: [
        { value: this.inputSubCategory, disabled: !this.isEditing() },
        [],
      ],
      director: [
        { value: this.inputDirector, disabled: !this.isEditing() },
        [],
      ],
      writer: [{ value: this.inputWriter, disabled: !this.isEditing() }, []],
      usertype: [
        { value: this.inputUserType, disabled: !this.isEditing() },
        [Validators.required],
      ],
      landscapeimage: [
        { value: this.landscapeFileURL, disabled: !this.isEditing() },
        [Validators.required],
      ],
      portraitimage: [
        { value: this.portraitFileURL, disabled: !this.isEditing() },
        [Validators.required],
      ],
      previewvideo: [
        { value: this.previewFileURL, disabled: !this.isEditing() },
        [Validators.required],
      ],
      fullvideo: [
        { value: this.fullFileURL, disabled: !this.isEditing() },
        [Validators.required],
      ],
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

  async backButton() {
    // Check all possible uploads
    const uploadTypes = ['landscape', 'portrait', 'preview', 'full'];
    for (const type of uploadTypes) {
      if (
        this.uploadProgress[type] !== undefined &&
        this.uploadProgress[type] < 100
      ) {
        this.featureService.handleError(
          `Please wait for ${type} upload to complete`
        );
        return;
      }
    }

    const changes = this.getChangedFields();
    if (Object.keys(changes).length === 0) {
      // Check if there are any uploaded files
      const noUploads =
        !this.uploadForm.get('landscapeimage')?.value ||
        !this.uploadForm.get('portraitimage')?.value ||
        !this.uploadForm.get('previewvideo')?.value ||
        !this.uploadForm.get('fullvideo')?.value;

      if (noUploads) {
        this.featureService.handleError(
          'Please upload all required files before proceeding.'
        );
      } else {
        this.dialogRef.close();
      }
    } else {
      this.featureService.handleError(
        'You have unsaved changes. Save content before proceeding.'
      );
    }
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing());
    this.buttonDisabled.set(!this.buttonDisabled());

    if (this.isEditing()) {
      this.uploadForm.enable();
    } else {
      this.uploadForm.disable();
    }
  }

  async publishAndScheduleContent(isForPublish: boolean) {
    try {
      // Check all possible uploads
      const uploadTypes = ['landscape', 'portrait', 'preview', 'full'];
      for (const type of uploadTypes) {
        if (
          this.uploadProgress[type] !== undefined &&
          this.uploadProgress[type] < 100
        ) {
          this.featureService.handleError(
            `Please wait for ${type} upload to complete`
          );
          return;
        }
      }

      const changes = this.getChangedFields();
      if (Object.keys(changes).length === 0) {
        // Check if there are any uploaded files
        const noUploads =
          !this.uploadForm.get('landscapeimage')?.value ||
          !this.uploadForm.get('portraitimage')?.value ||
          !this.uploadForm.get('previewvideo')?.value ||
          !this.uploadForm.get('fullvideo')?.value;

        if (noUploads) {
          this.featureService.handleError(
            'Please upload all required files before proceeding.'
          );
        }
      } else {
        this.featureService.handleError(
          'You have unsaved changes. Save content before proceeding.'
        );
      }

      if (!isForPublish) {
        const dialogResult = await firstValueFrom(
          this.dialog.open(InputDateComponent).afterClosed()
        );

        this.date = dialogResult;

        if (!this.date) {
          return;
        }
      }

      isForPublish ? this.isPublishing.set(true) : this.isScheduling.set(true);
      this.uploadForm.disable();

      await this.featureService
        .publishAndScheduleContent(this.id, isForPublish)
        .then(
          async (result) => {
            console.log(result.data);

            result.data
              ? (this.featureService.handleSuccess(
                  isForPublish
                    ? 'Content Published Successfully!'
                    : 'Content Scheduled Successfully!'
                ),
                this.dialogRef.close(true))
              : this.featureService.handleError(
                  'Updating Error, Please try again.'
                ),
              this.uploadForm.enable();
          },
          (error) => {
            isForPublish
              ? this.isPublishing.set(false)
              : this.isScheduling.set(false);
            this.featureService.handleError(error);
            this.uploadForm.enable();
          }
        );
    } catch (error) {
      console.error('Error publishing content:', error);
      this.uploadForm.enable();
    } finally {
      isForPublish
        ? this.isPublishing.set(false)
        : this.isScheduling.set(false);
      this.uploadForm.enable();
    }
    return;
  }

  async updateContent() {
    try {
      const changes = this.getChangedFields();
      // If no changes, return early
      if (Object.keys(changes).length === 0) {
        this.featureService.handleError('No changes detected');
        return;
      }

      // Check all possible uploads
      const uploadTypes = ['landscape', 'portrait', 'preview', 'full'];
      for (const type of uploadTypes) {
        if (
          this.uploadProgress[type] !== undefined &&
          this.uploadProgress[type] < 100
        ) {
          this.featureService.handleError(
            `Please wait for ${type} upload to complete`
          );
          return;
        }
      }

      this.isUpdating.set(true);
      this.uploadForm.disable();

      console.log({
        id: this.content.id,
        ...changes,
      });

      await this.featureService.updateContent(this.content.id, changes).then(
        async (result) => {
          console.log(result.data);

          result.data
            ? (this.featureService.handleSuccess(
                'Content Updated Successfully!'
              ),
              this.dialogRef.close(true))
            : this.featureService.handleError(
                'Updating Error, Please try again.'
              ),
            this.uploadForm.enable();
        },
        (error) => {
          this.isUpdating.set(false);
          this.featureService.handleError(error);
          this.uploadForm.enable();
        }
      );
    } catch (error) {
      console.error('Error publishing content:', error);
      this.uploadForm.enable();
    } finally {
      this.isUpdating.set(false);
    }
    return;
  }

  async removeMedia(path: string) {
    try {
      console.log('Removing...', path);
      this.buttonDisabled.set(true);
      const result = await remove({
        path: path,
      });
      if (result) {
        console.log('File Removed...', result);
        this.buttonDisabled.set(false);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async pauseUpload(mediaKey: string, dictionary: string) {
    console.log(
      `[Upload Pause] Dictionary: ${dictionary}, MediaKey: ${mediaKey}`
    );
    const task = this.uploadTasks[dictionary];
    if (!task) {
      console.log(
        `[Upload Pause] No active upload task found for ${dictionary}`
      );
      return;
    }

    try {
      await task.pause();
      this.isPaused[dictionary] = true;
      console.log(`[Upload Paused Successfully] Dictionary: ${dictionary}`);
    } catch (error) {
      console.error(`[Upload Pause Failed] Dictionary: ${dictionary}`, error);
    }
  }

  async resumeUpload(mediaKey: string, dictionary: string) {
    console.log(
      `[Upload Resume] Dictionary: ${dictionary}, MediaKey: ${mediaKey}`
    );
    const task = this.uploadTasks[dictionary];
    if (!task) {
      console.log(
        `[Upload Resume] No active upload task found for ${dictionary}`
      );
      return;
    }

    try {
      await task.resume();
      this.isPaused[dictionary] = false;
      console.log(`[Upload Resumed Successfully] Dictionary: ${dictionary}`);
    } catch (error) {
      console.error(`[Upload Resume Failed] Dictionary: ${dictionary}`, error);
    }
  }

  async cancelUpload(mediaKey: string, dictionary: string) {
    console.log(
      `[Upload Cancel] Dictionary: ${dictionary}, MediaKey: ${mediaKey}`
    );
    if (this.uploadTasks[dictionary]) {
      try {
        await this.uploadTasks[dictionary].cancel();
        this.uploadProgress[dictionary] = 0;
        delete this.uploadTasks[dictionary];

        // Reset the form control and file URL based on dictionary
        switch (dictionary) {
          case 'landscape':
            console.log('[Reset Landscape] Clearing landscape image data');
            this.landscapeFileURL = '';
            this.landscapeImageKey = '';
            this.uploadForm.get('landscapeimage')?.reset();
            break;
          case 'portrait':
            console.log('[Reset Portrait] Clearing portrait image data');
            this.portraitFileURL = '';
            this.portraitImageKey = '';
            this.uploadForm.get('portraitimage')?.reset();
            break;
          case 'preview':
            console.log('[Reset Preview] Clearing preview video data');
            this.previewFileURL = '';
            this.previewVideoKey = '';
            this.uploadForm.get('previewvideo')?.reset();
            break;
          case 'full':
            console.log('[Reset Full] Clearing full video data');
            this.fullFileURL = '';
            this.fullVideoKey = '';
            this.uploadForm.get('fullvideo')?.reset();
            break;
        }
        console.log(
          `[Upload Cancelled Successfully] Dictionary: ${dictionary}`
        );
      } catch (error) {
        console.error(
          `[Upload Cancel Failed] Dictionary: ${dictionary}`,
          error
        );
      }
    } else {
      console.log(`[Upload Cancel] No upload task found for ${dictionary}`);
    }
  }

  async deleteMedia(path: string, variable: string, presignedVariable: string) {
    try {
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: { message: 'Are you sure you want to delete this file?' },
        })
        .afterClosed()
        .subscribe(async (data) => {
          if (data) {
            this.removeMedia(path);
            const controlName =
              variable.replace('FileURL', '').toLowerCase() +
              (variable.toLowerCase().includes('full') ||
              variable.toLowerCase().includes('preview')
                ? 'video'
                : 'image');

            if (this.uploadForm.get(controlName)) {
              this.uploadForm.get(controlName)?.reset();
            }

            (this as any)[variable] = null;
            (this as any)[presignedVariable] = null;
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  async uploadMedia(
    file: File,
    mediaKey: string,
    dictionary: string
  ): Promise<void> {
    try {
      console.log('trying to upload...', file);

      // Clear any existing task for this dictionary
      if (this.uploadTasks[dictionary]) {
        delete this.uploadTasks[dictionary];
      }

      const result = await uploadData({
        data: file,
        path: mediaKey,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              this.uploadProgress[dictionary] = Math.round(
                (transferredBytes / totalBytes) * 100
              );
            }
          },
        },
      });

      // Store the upload task immediately after creation
      if (result) {
        this.uploadTasks[dictionary] = result;
        this.isPaused[dictionary] = false;

        try {
          await result.result; // Wait for upload to complete
          console.log('File Uploaded...', result);
          this.uploadProgress[dictionary] = 100;
        } catch (error) {
          if (isCancelError(error)) {
            console.log('Upload was cancelled');
            this.uploadProgress[dictionary] = 0;
          } else {
            console.error('Upload error:', error);
            this.uploadProgress[dictionary] = 0;
          }
        } finally {
          // Clean up the task reference
          delete this.uploadTasks[dictionary];
        }
      }
    } catch (e) {
      console.log('error', e);
      this.uploadProgress[mediaKey] = 0;
    }
  }

  // File selection handlers
  async onLandscapeImageSelected(event: any) {
    this.landscapeFilePresignedURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        const isValid = await FileValidator.validateImageFile(
          file,
          5 * 1024 * 1024, // 5MB max size
          1920,
          1080,
          3840,
          2160
        );

        if (!isValid) {
          this.uploadForm.patchValue({
            landscapeimage: '',
          });
          this.landscapeErrorMessage.set(
            'Landscape image validation failed. Image must be between 1920x1080 and 3840x2160, max 5MB.'
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.landscapeFilePresignedURL = String(reader.result);
        };
        reader.readAsDataURL(file);

        this.inputLandscapeImage = file;

        const landscapeImageKey = `landscape-images/${Date.now()}-${this.inputLandscapeImage.name
          .replace(/\s+/g, '')
          .replace(/[^A-Za-z0-9.\/-]/g, '')}`;

        this.landscapeImageKey = landscapeImageKey;
        //upload new media
        await this.uploadMedia(file, landscapeImageKey, 'landscape');
      } catch (error) {
        this.landscapeErrorMessage.set('Error processing image');
        console.error(error);
      }
    }
  }

  async onPortraitImageSelected(event: any) {
    this.portraitFilePresignedURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        const isValid = await FileValidator.validateImageFile(
          file,
          5 * 1024 * 1024, // 5MB max size
          1080, // min width
          1920, // min height
          2160, // max width
          3840 // max height
        );

        if (!isValid) {
          this.uploadForm.patchValue({
            portraitimage: '',
          });
          this.portraitErrorMessage.set(
            'Portrait image validation failed. Image must be between 1080x1920 and 2160x3840, max 5MB.'
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.portraitFilePresignedURL = String(reader.result);
        };
        reader.readAsDataURL(file);

        this.inputPortraitImage = file;

        const portraitImageKey = `portrait-images/${Date.now()}-${this.inputPortraitImage.name
          .replace(/\s+/g, '')
          .replace(/[^A-Za-z0-9.\/-]/g, '')}`;

        this.portraitImageKey = portraitImageKey;
        //upload new media
        this.uploadMedia(file, portraitImageKey, 'portrait');
      } catch (error) {
        this.portraitErrorMessage.set('Error processing image');
        console.error(error);
      }
    }
  }

  async onPreviewVideoSelected(event: any) {
    this.previewFilePresignedURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        // Validate preview video (smaller size and duration limits)
        const isValid = await FileValidator.validateVideoFile(
          file,
          100 * 1024 * 1024, // 100MB limit for preview
          40 // 40 secs limit for preview
        );

        if (!isValid) {
          this.uploadForm.patchValue({
            previewvideo: '',
          });
          this.previewErrorMessage.set(
            'Preview video validation failed. Please check file size and duration.'
          );
          return;
        }

        // Clean up previous preview URL
        if (this.previewFilePresignedURL) {
          URL.revokeObjectURL(this.previewFilePresignedURL);
        }

        // Create new preview URL
        this.previewFilePresignedURL = URL.createObjectURL(file);

        this.inputPreviewVideo = file;

        const previewVideoKey = `preview-videos/${Date.now()}-${this.inputPreviewVideo.name
          .replace(/\s+/g, '')
          .replace(/[^A-Za-z0-9.\/-]/g, '')}`;

        this.previewVideoKey = previewVideoKey;
        //upload new media
        this.uploadMedia(file, previewVideoKey, 'preview');
      } catch (error) {
        this.previewErrorMessage.set('Error processing video');
        console.error(error);
      }
    }
  }

  async onFullVideoSelected(event: any) {
    this.fullFilePresignedURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        // Validate full video (larger size and duration limits)
        const isValid = await FileValidator.validateVideoFile(
          file,
          10 * 1024 * 1024 * 1024, // 10GB limit
          10800 // 3 hours in seconds
        );

        if (!isValid) {
          this.uploadForm.patchValue({
            fullvideo: '',
          });
          this.fullErrorMessage.set(
            'Full video validation failed. Please check file size and duration.'
          );
          return;
        }

        // Clean up previous preview URL
        if (this.fullFilePresignedURL) {
          URL.revokeObjectURL(this.fullFilePresignedURL);
        }

        // Create new preview URL
        this.fullFilePresignedURL = URL.createObjectURL(file);

        const reader = new FileReader();
        reader.onload = () => {
          this.fullFilePresignedURL = String(reader.result);
        };
        reader.readAsDataURL(file);

        // Get video metadata as before
        const video = document.createElement('video');
        video.preload = 'metadata';

        const url = URL.createObjectURL(file);
        video.src = url;

        video.onloadedmetadata = () => {
          const duration = video.duration;
          const width = video.videoWidth;
          const height = video.videoHeight;
          const quality = this.getVideoQuality(width, height);

          this.videoMetadata = {
            duration,
            width,
            height,
            quality,
            size: file.size,
            type: file.type,
          };

          URL.revokeObjectURL(url);
        };

        this.inputFullVideo = file;

        const fullVideoKey = `full-videos/${Date.now()}-${this.inputFullVideo.name
          .replace(/\s+/g, '')
          .replace(/[^A-Za-z0-9.\/-]/g, '')}`;
        this.fullVideoKey = fullVideoKey;
        //upload new media
        this.uploadMedia(file, fullVideoKey, 'full');
      } catch (error) {
        this.fullErrorMessage.set('Error processing video');
        console.error(error);
      }
    }
  }

  private getVideoQuality(width: number, height: number): string {
    const resolution = Math.max(width, height);

    if (resolution >= 7680) return '8K';
    if (resolution >= 3840) return '4K';
    if (resolution >= 1920) return '1080p';
    return '720p';
  }
}
