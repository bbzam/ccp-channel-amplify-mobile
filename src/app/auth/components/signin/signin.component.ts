import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';
import { disallowCharacters } from '../../../shared/utils/validators';
import { errorMessages } from '../../../shared/utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { SignupComponent } from '../signup/signup.component';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../auth-service.service';
import { BetaAccessComponent } from '../../../beta-test/beta-access/beta-access.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { InputComponent } from '../../../shared/component/input/input.component';

@Component({
  selector: 'app-signin',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  inputEmail!: string;
  inputPassword!: string;
  signingIn: boolean = false;
  isPasswordVisible = false;
  emailErrorMessage = signal('');
  passwordErrorMessage = signal('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<SigninComponent>);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthServiceService);

  signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, disallowCharacters()]],
    password: ['', [Validators.required, disallowCharacters()]],
  });

  constructor() {
    this.setupFormValidation();
  }

  ngOnInit(): void {}

  private setupFormValidation(): void {
    const emailControl = this.signInForm.get('email');
    const passwordControl = this.signInForm.get('password');

    emailControl?.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.updateErrorMessage(emailControl, this.emailErrorMessage)
      );

    passwordControl?.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() =>
        this.updateErrorMessage(passwordControl, this.passwordErrorMessage)
      );
  }

  private updateErrorMessage(control: any, errorSignal: any): void {
    if (control.hasError('required')) {
      errorSignal.set(errorMessages.REQUIRED);
    } else if (control.hasError('disallowedCharacters')) {
      errorSignal.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      errorSignal.set('');
    }
  }

  async login(): Promise<void> {
    if (this.signInForm.invalid) {
      return;
    }

    try {
      this.signingIn = true;
      const { email, password } = this.signInForm.value;
      const isSuccess = await this.authService.signIn(email, password);

      if (isSuccess) {
        this.dialogRef.close(true);
      } else {
        this.dialogRef.close(false);
        console.log('Sign-in requires further confirmation.');
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      this.signingIn = false;
    }
  }

  resetPasswordOnClick() {
    this.dialogRef.close();
    const content = {
      inputType: 'email',
      title: 'Email Verification',
      subtitle: 'Enter your email to proceed',
      label: 'Email',
      placeholder: 'Enter your email',
      buttonText: 'Submit',
      buttonTextLoading: 'Submitting...',
    };
    this.dialog
      .open(InputComponent, { data: content })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.handlePasswordReset(data);
        }
      });
  }

  async handlePasswordReset(username: string) {
    try {
      const response = await this.authService.resetPassword(username);
      if (response) {
        this.dialog
          .open(ResetPasswordComponent, { panelClass: 'dialog' })
          .afterClosed()
          .subscribe((data) => {
            if (data) {
              this.handleConfirmReset(username, data.password, data.code);
            }
          });
      }
    } catch (error) {
      console.error('Failed to initiate password reset');
      this.authService.handleError(error);
    }
  }

  async handleConfirmReset(
    username: string,
    newPassword: string,
    code: string
  ) {
    try {
      const isConfirmed = await this.authService.confirmResetPassword(
        username,
        newPassword,
        code
      );
      if (isConfirmed) {
        this.authService.handleSuccess('Password reset successful!');
      }
    } catch (error) {
      console.error('Failed to confirm password reset');
      this.authService.handleError(error);
    }
  }

  signUpOnClick(): void {
    this.dialogRef.close();
    // this.dialog
    //   .open(BetaAccessComponent)
    //   .afterClosed()
    //   .subscribe((data) => {
    //     if (data) {
          this.dialog
            .open(SignupComponent, { disableClose: true })
            .afterClosed();
      //   }
      // });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
