import {
  Component,
  computed,
  inject,
  OnDestroy,
  Signal,
  signal,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, merge } from 'rxjs';
import { FileValidator } from '../../utils/file-validation';
import { disallowCharacters } from '../../utils/validators';
import { errorMessages } from '../../utils/errorMessages';
import { FeaturesService } from '../../../features/features.service';
import { UpdatePasswordComponent } from '../../../auth/components/update-password/update-password.component';
import { MatDialog } from '@angular/material/dialog';

interface UserDetails {
  profilePic?: string;
  email: string;
  given_name: string;
  family_name: string;
  birthdate: string;
  email_verified: string;
  user_status: string;
  enabled: boolean;
  created_at: string;
  last_modified: string;
}

@Component({
  selector: 'app-account-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatDividerModule,
    DatePipe,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css',
})
export class AccountSettingsComponent implements OnDestroy {
  readonly featuresService = inject(FeaturesService);
  readonly dialog = inject(MatDialog);
  readonly isEditing = signal(false);
  readonly user = signal<UserDetails | null>(null);
  profileForm!: FormGroup;
  currentYear = new Date().getFullYear();
  profileImageURL: string = '';
  profileImageKey: string = '';
  uploadProgress: number = 0;
  errorMessages = errorMessages;

  // Error message signals
  profilePicErrorMessage = signal('');
  emailErrorMessage = signal('');
  given_nameErrorMessage = signal('');
  family_nameErrorMessage = signal('');
  birthdateErrorMessage = signal('');
  email_verifiedErrorMessage = signal('');
  user_statusErrorMessage = signal('');
  enabledErrorMessage = signal('');
  created_atErrorMessage = signal('');
  last_modifiedErrorMessage = signal('');

  private readonly fb = inject(FormBuilder);

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.profileForm.valid,
    isDirty: this.profileForm.dirty,
    isPristine: this.profileForm.pristine,
  }));

  constructor() {
    this.getCurrentUser();
    this.initializeForm();
    this.setupValidationSubscriptions();
  }

  ngOnDestroy() {
    if (this.profileImageURL) {
      URL.revokeObjectURL(this.profileImageURL);
    }
  }

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      profilePic: [
        this.user()?.profilePic || '',
        [Validators.required, disallowCharacters()],
      ],
      email: [
        this.user()?.email || '',
        [Validators.email, disallowCharacters()],
      ],
      given_name: [
        this.user()?.given_name || '',
        [Validators.required, disallowCharacters()],
      ],
      family_name: [
        this.user()?.family_name || '',
        [Validators.required, disallowCharacters()],
      ],
      birthdate: [this.user()?.birthdate || '', [disallowCharacters()]],
      email_verified: [
        this.user()?.email_verified || '',
        [disallowCharacters()],
      ],
      user_status: [this.user()?.user_status || '', [disallowCharacters()]],
      enabled: [this.user()?.enabled || false],
      created_at: [this.user()?.created_at || '', [disallowCharacters()]],
      last_modified: [this.user()?.last_modified || '', [disallowCharacters()]],
    });
  }

  private setupValidationSubscriptions(): void {
    const controls = [
      'profilePic',
      'given_name',
      'family_name',
      'birthdate',
      'email_verified',
      'user_status',
      'enabled',
      'created_at',
      'last_modified',
    ];

    controls.forEach((controlName) => {
      const control = this.profileForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });
  }

  async getCurrentUser() {
    try {
      const email = String(sessionStorage.getItem('email'));
      const user = await this.featuresService.getCurrentUser(email);
      console.log('Current user:', user);

      if (user) {
        // Set the user data from the API response
        this.user.set(user);
        // Reinitialize the form with the new data
        this.initializeForm();
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  }

  updatePasswordOnClick() {
    this.dialog
      .open(UpdatePasswordComponent, { panelClass: 'dialog' })
      .afterClosed();
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
    if (this.isEditing()) {
      this.initializeForm();
    }
  }

  saveChanges(): void {
    if (this.profileForm.valid) {
      // Merge existing user data with form values
      const updatedAttorney = {
        ...this.user(),
        ...this.profileForm.value,
      };
      this.user.set(updatedAttorney);
      this.isEditing.set(false);

      // Here you could add code to save the updated user data to your backend
      // For example:
      // this.featuresService.updateAttorney(updatedAttorney);
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    // Reset form to current user data
    this.initializeForm();
  }

  // async onImageChange(event: any): Promise<void> {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   try {
  //     const result = await FileValidator.validateImageFile(
  //       file,
  //       5 * 1024 * 1024, // 5MB max size
  //       200, // min width
  //       200, // min height
  //       3000, // max width
  //       3000 // max height
  //     );

  //     if (!result.valid) {
  //       this.profileForm.patchValue({ profilePic: '' });
  //       this.profilePicErrorMessage.set(
  //         result.error ||
  //           'Profile image must be between 200x200 and 3000x3000 pixels, max 5MB.'
  //       );
  //       return;
  //     } else {
  //       this.profilePicErrorMessage.set('');
  //     }

  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.profileImageURL = e.target.result;
  //       this.profileForm.patchValue({
  //         profilePic: this.profileImageURL,
  //       });
  //     };
  //     reader.readAsDataURL(file);

  //     // Generate unique key for the image
  //     const profileImageKey = `public-files/${Date.now()}-${file.name
  //       .replace(/\s+/g, '')
  //       .replace(/[^A-Za-z0-9.\/-]/g, '')}`;

  //     this.profileImageKey = profileImageKey;

  //     // Here you can implement your upload logic similar to your original code
  //     // For example:
  //     // await this.uploadMedia(file, profileImageKey, 'profile');
  //   } catch (error) {
  //     this.profilePicErrorMessage.set('Error processing image');
  //     console.error('Error uploading image:', error);
  //   }
  // }

  private updateErrorMessage(controlName: string): void {
    const control = this.profileForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      profilePic: this.profilePicErrorMessage,
      given_name: this.given_nameErrorMessage,
      family_name: this.family_nameErrorMessage,
      birthdate: this.birthdateErrorMessage,
      email_verified: this.email_verifiedErrorMessage,
      user_status: this.user_statusErrorMessage,
      email: this.emailErrorMessage,
    };

    const signal = errorSignalMap[controlName];
    if (!signal) return;

    if (control.hasError('required')) {
      signal.set(errorMessages.REQUIRED);
    } else if (control.hasError('minlength')) {
      signal.set(
        `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`
      );
    } else if (control.hasError('min')) {
      signal.set(`Minimum year allowed is ${control.errors?.['min'].min}`);
    } else if (control.hasError('max')) {
      signal.set(`Maximum year allowed is ${control.errors?.['max'].max}`);
    } else if (control.hasError('disallowedCharacters')) {
      signal.set(errorMessages.DISALLOWEDCHARACTERS);
    } else if (control.hasError('email')) {
      signal.set('Please enter a valid email address');
    } else {
      signal.set('');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
