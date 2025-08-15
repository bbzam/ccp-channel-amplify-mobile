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
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reset-password',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<ResetPasswordComponent>);
  private readonly authService = inject(AuthServiceService);
  private readonly fb = inject(FormBuilder);

  resetPassForm!: FormGroup;
  readonly isLoading = signal(false);
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  // Error message signals
  codeErrorMessage = signal('');
  passwordErrorMessage = signal('');
  confirmPasswordErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.resetPassForm.valid,
    isDirty: this.resetPassForm.dirty,
    isPristine: this.resetPassForm.pristine,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  private createForm(): void {
    this.resetPassForm = this.fb.group({
      code: ['', [Validators.required, disallowCharacters()]],
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
    const passwordControl = this.resetPassForm.get('password');
    const confirmPasswordControl = this.resetPassForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      confirmPasswordControl.addValidators(isMatch(passwordControl));
    }
  }

  private setupValidationSubscriptions(): void {
    const controls = ['code', 'password', 'confirmPassword'];

    controls.forEach((controlName) => {
      const control = this.resetPassForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });

    // Update confirm password validation when password changes
    const passwordControl = this.resetPassForm.get('password');
    const confirmPasswordControl = this.resetPassForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      passwordControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
        confirmPasswordControl.updateValueAndValidity();
      });
    }
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.resetPassForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      code: this.codeErrorMessage,
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

  async resetPassOnClick(): Promise<void> {
    if (this.resetPassForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.resetPassForm.value;
      this.dialogRef.close(formData);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  signInOnClick(): void {
    this.dialogRef.close();
    this.dialog.open(SigninComponent).afterClosed().subscribe();
  }

  close() {
    this.dialogRef.close();
  }
}
