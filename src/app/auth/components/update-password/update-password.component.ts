import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { distinctUntilChanged, merge } from 'rxjs';
import { errorMessages } from '../../../shared/utils/errorMessages';
import {
  disallowCharacters,
  hasLowercase,
  hasMinimumLength,
  hasNumber,
  hasSpecialCharacter,
  hasUppercase,
  isMatch,
} from '../../../shared/utils/validators';
import { MatDividerModule } from '@angular/material/divider';
import { SigninComponent } from '../signin/signin.component';
import { AuthServiceService } from '../../auth-service.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-update-password',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
  ],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css',
})
export class UpdatePasswordComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<UpdatePasswordComponent>);
  private readonly authService = inject(AuthServiceService);
  private readonly fb = inject(FormBuilder);

  updatePassForm!: FormGroup;
  readonly isLoading = signal(false);

  // Error message signals
  oldPasswordErrorMessage = signal('');
  passwordErrorMessage = signal('');
  confirmPasswordErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.updatePassForm.valid,
    isDirty: this.updatePassForm.dirty,
    isPristine: this.updatePassForm.pristine,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  private createForm(): void {
    this.updatePassForm = this.fb.group({
      oldPassword: ['', [Validators.required, disallowCharacters()]],
      password: [
        '',
        [
          Validators.required,
          hasUppercase(),
          hasLowercase(),
          hasSpecialCharacter(),
          hasNumber(),
          hasMinimumLength(),
          disallowCharacters(),
        ],
      ],
      confirmPassword: ['', [Validators.required, disallowCharacters()]],
    });

    // Password matching validator to confirm password field
    const passwordControl = this.updatePassForm.get('password');
    const confirmPasswordControl = this.updatePassForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      confirmPasswordControl.addValidators(isMatch(passwordControl));
    }
  }

  private setupValidationSubscriptions(): void {
    const controls = ['oldPassword', 'password', 'confirmPassword'];

    controls.forEach((controlName) => {
      const control = this.updatePassForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });

    // Update confirm password validation when password changes
    const passwordControl = this.updatePassForm.get('password');
    const confirmPasswordControl = this.updatePassForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      passwordControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
        confirmPasswordControl.updateValueAndValidity();
      });
    }
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.updatePassForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      oldPassword: this.oldPasswordErrorMessage,
      password: this.passwordErrorMessage,
      confirmPassword: this.confirmPasswordErrorMessage,
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

  async updatePassOnClick(): Promise<void> {
    if (this.updatePassForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.updatePassForm.value;
      const data = {
        oldPassword: formData.oldPassword,
        newPassword: formData.password,
      };
      const isSuccess = await this.authService.updatePassword(data);
      this.dialogRef.close();

      if (!isSuccess) {
        console.log('requires further confirmation.');
      }
    } catch (error) {
      console.error('failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  signInOnClick(): void {
    this.dialogRef.close();
    this.dialog.open(SigninComponent).afterClosed().subscribe();
  }
}
