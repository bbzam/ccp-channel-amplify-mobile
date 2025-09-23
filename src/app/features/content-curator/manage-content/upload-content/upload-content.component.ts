import { Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
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
import { FeaturesService } from '../../../features.service';
import { Location } from '@angular/common';
import { distinctUntilChanged, firstValueFrom, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { errorMessages } from '../../../../shared/utils/errorMessages';
import { InputDateComponent } from '../../../../shared/component/input-date/input-date.component';
import { FileValidator } from '../../../../shared/utils/file-validation';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConfirmationDialogComponent } from '../../../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { disallowCharacters } from '../../../../shared/utils/validators';
import { SharedService } from '../../../../shared/shared.service';
import { MatSelectModule } from '@angular/material/select';
import { IdleTimerService } from '../../../../auth/idle-timer.service';

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
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
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
  inputYearReleased!: string;
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
  landscapeImageKey!: string;
  portraitImageKey!: string;
  previewVideoKey!: string;
  fullVideoKey!: string;
  uploadForm!: FormGroup;
  landscapeUploadProgress: number = 0;
  portraitUploadProgress: number = 0;
  previewUploadProgress: number = 0;
  fullUploadProgress: number = 0;
  uploadProgress: { [key: string]: number } = {};
  uploadTasks: { [key: string]: any } = {};
  isPaused: { [key: string]: boolean } = {
    landscape: false,
    portrait: false,
    preview: false,
    full: false,
  };
  currentYear = new Date().getFullYear();
  customFields: any[] = [];
  selectedCustomFields: { fieldId: string; value: string }[] = [];

  readonly isLoading = signal(false);
  readonly isScheduling = signal(false);
  private readonly dialogRef = inject(MatDialogRef<UploadContentComponent>);
  private readonly featureService = inject(FeaturesService);
  private readonly sharedService = inject(SharedService);
  private readonly idleTimerService = inject(IdleTimerService);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  // Error message signals
  titleErrorMessage = signal('');
  descriptionErrorMessage = signal('');
  categoryErrorMessage = signal('');
  subCategoryErrorMessage = signal('');
  directorErrorMessage = signal('');
  writerErrorMessage = signal('');
  yearReleasedErrorMessage = signal('');
  userTypeErrorMessage = signal('');
  landscapeErrorMessage = signal('');
  portraitErrorMessage = signal('');
  previewErrorMessage = signal('');
  fullErrorMessage = signal('');
  customFieldsErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.uploadForm.valid,
    isDirty: this.uploadForm.dirty,
    isPristine: this.uploadForm.pristine,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
    this.isPaused['preview'] = false;
    this.loadCustomFields();
  }

  private createForm(): void {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, disallowCharacters()]],
      description: ['', [Validators.required, disallowCharacters()]],
      category: ['', [Validators.required, disallowCharacters()]],
      subcategory: ['', [disallowCharacters()]],
      director: ['', [disallowCharacters()]],
      writer: ['', [disallowCharacters()]],
      yearreleased: [
        '',
        [
          disallowCharacters(),
          Validators.min(1900),
          Validators.max(this.currentYear),
          Validators.pattern('^[0-9]{4}$'),
        ],
      ],
      usertype: ['', [Validators.required, disallowCharacters()]],
      landscapeimage: ['', [Validators.required, disallowCharacters()]],
      portraitimage: ['', [Validators.required, disallowCharacters()]],
      previewvideo: ['', [Validators.required, disallowCharacters()]],
      fullvideo: ['', [Validators.required, disallowCharacters()]],
      customFields: this.fb.array([]),
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
      'yearreleased',
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

  get customFieldsFormArray() {
    return this.uploadForm.get('customFields') as FormArray;
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
      yearreleased: this.yearReleasedErrorMessage,
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
    } else if (control.hasError('min')) {
      signal.set('Year must be 1900 or later');
    } else if (control.hasError('max')) {
      signal.set(`Year cannot be later than ${this.currentYear}`);
    } else if (control.hasError('pattern')) {
      signal.set('Please enter a valid 4-digit year');
    } else {
      signal.set('');
    }
  }

  triggerFileInput(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    input?.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent, type: string) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const mockEvent = { target: { files: [file] } };

      switch (type) {
        case 'landscape':
          this.onLandscapeImageSelected(mockEvent);
          break;
        case 'portrait':
          this.onPortraitImageSelected(mockEvent);
          break;
        case 'preview':
          this.onPreviewVideoSelected(mockEvent);
          break;
        case 'full':
          this.onFullVideoSelected(mockEvent);
          break;
      }
    }
  }

  schedulePublish() {}

  async backButton() {
    // Check all possible uploads
    // const uploadTypes = ['landscape', 'portrait', 'preview', 'full'];
    // for (const type of uploadTypes) {
    //   if (
    //     this.uploadProgress[type] !== undefined &&
    //     this.uploadProgress[type] < 100
    //   ) {
    //     this.featureService.handleError(
    //       `Please wait for ${type} upload to complete`
    //     );
    //     return;
    //   }
    // }

    // Check if there are any uploaded files
    const hasUploads =
      this.landscapeImageKey ||
      this.portraitImageKey ||
      this.previewVideoKey ||
      this.fullVideoKey;

    if (hasUploads) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          message:
            'You have uploaded files. If you leave, these uploads will be deleted. Do you want to continue?',
        },
      });

      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        // Remove all uploaded files if they exist
        if (this.landscapeImageKey) {
          await this.removeMedia(this.landscapeImageKey);
        }
        if (this.portraitImageKey) {
          await this.removeMedia(this.portraitImageKey);
        }
        if (this.previewVideoKey) {
          await this.removeMedia(this.previewVideoKey);
        }
        if (this.fullVideoKey) {
          await this.removeMedia(this.fullVideoKey);
        }

        this.dialogRef.close();
      }
      return;
    }

    // If no uploads, simply close the dialog
    this.dialogRef.close();
  }

  async loadCustomFields() {
    try {
      this.customFields = await this.sharedService.getAllCustomFields();
    } catch (error) {}
  }

  addCustomField() {
    const customFieldGroup = this.fb.group({
      fieldId: [''],
      value: [''],
    });
    this.customFieldsFormArray.push(customFieldGroup);
  }

  removeCustomField(index: number) {
    this.customFieldsFormArray.removeAt(index);
  }

  getAvailableFields(currentIndex: number) {
    const selectedFieldIds = this.customFieldsFormArray.controls
      .map((control, index) =>
        index !== currentIndex ? control.get('fieldId')?.value : null
      )
      .filter((id) => id);

    return this.customFields.filter(
      (field) => !selectedFieldIds.includes(field.id)
    );
  }

  async publishContent(isForPublish: boolean) {
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

      if (!isForPublish) {
        const dialogResult = await firstValueFrom(
          this.dialog.open(InputDateComponent).afterClosed()
        );

        this.date = dialogResult;

        if (!this.date) {
          return;
        }
      }

      // Validate custom fields before starting upload process
      // if (
      //   this.selectedCustomFields.length > 0 &&
      //   !this.validateCustomFields()
      // ) {
      //   return;
      // }

      isForPublish ? this.isLoading.set(true) : this.isScheduling.set(true);
      this.uploadForm.disable();

      const customFieldsArray =
        this.uploadForm.get('customFields')?.value || [];

      const formData = this.uploadForm.value;
      const contentMetadata = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subCategory: formData.subcategory,
        director: formData.director,
        writer: formData.writer,
        yearReleased: formData.yearreleased,
        userType: formData.usertype,
        landscapeImageUrl: `processed-${this.landscapeImageKey}`,
        portraitImageUrl: `processed-${this.portraitImageKey}`,
        previewVideoUrl: this.previewVideoKey,
        fullVideoUrl: this.fullVideoKey,
        runtime: this.videoMetadata?.duration || 0,
        resolution: this.videoMetadata?.quality || '',
        status: isForPublish,
        publishDate: this.date,
        customFields: JSON.stringify(
          customFieldsArray.reduce(
            (acc: Record<string, string>, field: any) => {
              if (field.fieldId && field.value) {
                acc[field.fieldId] = field.value;
              }
              return acc;
            },
            {}
          )
        ),
      };

      await this.featureService.createContent(contentMetadata).then(
        async (result) => {
          result.data &&
            (this.featureService.handleSuccess(
              isForPublish
                ? 'Content uploaded successfully! Publishing in progress...'
                : 'Content uploaded successfully! Scheduling in progress...'
            ),
            this.dialogRef.close());

          this.uploadForm.enable();
        },
        (error) => {
          isForPublish
            ? this.isLoading.set(false)
            : this.isScheduling.set(false);
          this.featureService.handleError(error);
          this.uploadForm.enable();
        }
      );
    } catch (error) {
      this.uploadForm.enable();
    } finally {
      this.uploadForm.enable();
      isForPublish ? this.isLoading.set(false) : this.isScheduling.set(false);
    }
    return;
  }

  async removeMedia(path: string) {
    try {
      const finalPath =
        path.includes('landscape') || path.includes('portrait')
          ? `processed-${path}`
          : path;

      const result = await remove({
        path: finalPath,
      });
    } catch (error) {}
  }

  async pauseUpload(mediaKey: string, dictionary: string) {
    const task = this.uploadTasks[dictionary];
    if (!task) {
      return;
    }

    try {
      await task.pause();
      this.isPaused[dictionary] = true;
    } catch (error) {}
  }

  async resumeUpload(mediaKey: string, dictionary: string) {
    const task = this.uploadTasks[dictionary];
    if (!task) {
      return;
    }

    try {
      await task.resume();
      this.isPaused[dictionary] = false;
    } catch (error) {}
  }

  async cancelUpload(mediaKey: string, dictionary: string) {
    if (this.uploadTasks[dictionary]) {
      try {
        await this.uploadTasks[dictionary].cancel();
        this.uploadProgress[dictionary] = 0;
        delete this.uploadTasks[dictionary];

        // Reset the form control and file URL based on dictionary
        switch (dictionary) {
          case 'landscape':
            this.landscapeFileURL = '';
            this.landscapeImageKey = '';
            this.uploadForm.get('landscapeimage')?.reset();
            break;
          case 'portrait':
            this.portraitFileURL = '';
            this.portraitImageKey = '';
            this.uploadForm.get('portraitimage')?.reset();
            break;
          case 'preview':
            this.previewFileURL = '';
            this.previewVideoKey = '';
            this.uploadForm.get('previewvideo')?.reset();
            break;
          case 'full':
            this.fullFileURL = '';
            this.fullVideoKey = '';
            this.uploadForm.get('fullvideo')?.reset();
            break;
        }
      } catch (error) {}
    } else {
    }
  }

  async deleteMedia(path: string, variable: string, variableKey: string) {
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
            (this as any)[variableKey] = '';
          }
        });
    } catch (error) {}
  }

  async uploadMedia(
    file: File,
    mediaKey: string,
    dictionary: string
  ): Promise<void> {
    try {
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
              this.idleTimerService.handleActivity();
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
          this.uploadProgress[dictionary] = 100;
        } catch (error) {
          if (isCancelError(error)) {
            this.uploadProgress[dictionary] = 0;
          } else {
            this.uploadProgress[dictionary] = 0;
          }
        } finally {
          // Clean up the task reference
          delete this.uploadTasks[dictionary];
        }
      }
    } catch (e) {
      this.uploadProgress[mediaKey] = 0;
    }
  }

  // File selection handlers
  async onLandscapeImageSelected(event: any) {
    this.landscapeFileURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        const validation = await FileValidator.validateImageFile(
          file,
          5 * 1024 * 1024, // 5MB max size
          1920,
          1080,
          3840,
          2160
        );

        if (!validation.valid) {
          this.uploadForm.patchValue({
            landscapeimage: '',
          });
          this.landscapeErrorMessage.set(
            validation.error || 'Landscape image validation failed'
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.landscapeFileURL = String(reader.result);
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
      }
    }
  }

  async onPortraitImageSelected(event: any) {
    this.portraitFileURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        const validation = await FileValidator.validateImageFile(
          file,
          5 * 1024 * 1024, // 5MB max size
          1080, // min width
          1920, // min height
          2160, // max width
          3840 // max height
        );

        if (!validation.valid) {
          this.uploadForm.patchValue({
            portraitimage: '',
          });
          this.portraitErrorMessage.set(
            validation.error || 'Portrait image validation failed'
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.portraitFileURL = String(reader.result);
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
      }
    }
  }

  async onPreviewVideoSelected(event: any) {
    this.previewFileURL = '';
    const file = event.target.files[0];
    if (!file) {
      return;
    } else {
      try {
        // Validate preview video (smaller size and duration limits)
        const validation = await FileValidator.validateVideoFile(
          file,
          3 * 1024 * 1024 * 1024, // 3GB limit for preview
          35 // 35 secs limit for preview
        );

        if (!validation.valid) {
          this.uploadForm.patchValue({
            previewvideo: '',
          });
          this.previewErrorMessage.set(
            validation.error || 'Preview video validation failed'
          );
          return;
        }

        // Clean up previous preview URL
        if (this.previewFileURL) {
          URL.revokeObjectURL(this.previewFileURL);
        }

        // Create new preview URL
        this.previewFileURL = URL.createObjectURL(file);

        this.inputPreviewVideo = file;

        const previewVideoKey = `preview-videos/${Date.now()}-${this.inputPreviewVideo.name
          .replace(/\s+/g, '')
          .replace(/[^A-Za-z0-9.\/-]/g, '')}`;

        this.previewVideoKey = previewVideoKey;
        //upload new media
        this.uploadMedia(file, previewVideoKey, 'preview');
      } catch (error) {
        this.previewErrorMessage.set('Error processing video');
      }
    }
  }

  async onFullVideoSelected(event: any) {
    this.fullFileURL = '';
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate full video (larger size and duration limits)
      const validation = await FileValidator.validateVideoFile(
        file,
        16 * 1024 * 1024 * 1024, // 16GB limit
        10800 // 3 hours in seconds
      );

      if (!validation.valid) {
        this.uploadForm.patchValue({ fullvideo: '' });
        this.fullErrorMessage.set(
          validation.error || 'Full video validation failed'
        );
        return;
      }

      // Clean up previous preview URL
      if (this.fullFileURL) {
        URL.revokeObjectURL(this.fullFileURL);
      }

      // Create new preview URL
      this.fullFileURL = URL.createObjectURL(file);

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
    }
  }

  private getVideoQuality(width: number, height: number): string {
    const resolution = Math.max(width, height);

    if (resolution >= 7680) return '8K';
    if (resolution >= 3840) return '4K';
    if (resolution >= 1920) return '1080p';
    return '720p';
  }

  close() {
    this.dialogRef.close();
  }

  // ngOnDestroy to clean up URLs
  ngOnDestroy() {
    if (this.previewFileURL) {
      URL.revokeObjectURL(this.previewFileURL);
    }
    if (this.fullFileURL) {
      URL.revokeObjectURL(this.fullFileURL);
    }
  }
}
