import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
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
    FormsModule,
    ReactiveFormsModule,
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

  ngOnInit(): void {}

  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<SigninComponent>);
  readonly router = inject(Router);
  readonly authService = inject(AuthServiceService);

  // Form Controls
  readonly email = new FormControl('', [
    Validators.required,
    disallowCharacters(),
  ]);

  readonly password = new FormControl('', [
    Validators.required,
    disallowCharacters(),
  ]);

  constructor() {
    // Email validation error updates
    merge(this.email.statusChanges, this.email.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateEmailErrorMessage());

    // Password validation error updates
    merge(this.password.statusChanges, this.password.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updatePasswordErrorMessage());
  }

  updateEmailErrorMessage() {
    if (this.email.hasError('required')) {
      this.emailErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.email.hasError('disallowedCharacters')) {
      this.emailErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.emailErrorMessage.set('');
    }
  }

  updatePasswordErrorMessage() {
    if (this.password.hasError('required')) {
      this.passwordErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.password.hasError('disallowedCharacters')) {
      this.passwordErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.passwordErrorMessage.set('');
    }
  }

  async login() {
    this.signingIn = true;
    try {
      const isSuccess = await this.authService.signIn(
        this.inputEmail,
        this.inputPassword
      );
      if (isSuccess) {
        this.dialogRef.close();
        this.signingIn = false;
      } else {
        this.signingIn = false;
        this.dialogRef.close();
        console.log('Sign-in requires further confirmation.');
      }
    } catch (error) {
      this.signingIn = false;
      console.error('Sign-in failed:', error);
    } finally {
      this.signingIn = false;
    }
  }

  signUpOnClick() {
    this.dialogRef.close();
    this.dialog
      .open(SignupComponent)
      .afterClosed()
      .subscribe((data) => {});
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
