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
import { errorMessages } from '../../../shared/utils/errorMessages';
import {
  allowMax100,
  allowMax3,
  allowOnlyNumeric,
  disallowCharacters,
  emailValidator,
  hasLowercase,
  hasMinimumLength,
  hasNumber,
  hasSpecialCharacter,
  hasUppercase,
  isMatch,
  passwordValidator,
} from '../../../shared/utils/validators';
import { MatDividerModule } from '@angular/material/divider';
import { SigninComponent } from '../signin/signin.component';
import { AuthServiceService } from '../../auth-service.service';

@Component({
  selector: 'app-signup',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  signingUp: boolean = false;
  inputFirstname!: string;
  inputLastname!: string;
  inputEmail!: string;
  inputBirthdate!: number;
  inputPassword!: string;
  inputConfirmPassword!: string;

  firstnameErrorMessage = signal('');
  lastnameErrorMessage = signal('');
  emailErrorMessage = signal('');
  ageErrorMessage = signal('');
  passwordErrorMessage = signal('');
  confirmPasswordErrorMessage = signal('');

  ngOnInit(): void {}

  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<SignupComponent>);
  readonly authService = inject(AuthServiceService);

  // Form Controls
  readonly formControlFirstname = new FormControl('', [
    Validators.required,
    allowMax100(),
    disallowCharacters(),
  ]);

  readonly formControlLastname = new FormControl('', [
    Validators.required,
    allowMax100(),
    disallowCharacters(),
  ]);

  readonly formControlEmail = new FormControl('', [
    Validators.required,
    emailValidator(),
    disallowCharacters(),
  ]);

  readonly formControlAge = new FormControl('', [
    Validators.required,
    disallowCharacters(),
  ]);

  readonly formControlPassword = new FormControl('', [
    Validators.required,
    hasUppercase(),
    hasLowercase(),
    hasSpecialCharacter(),
    hasNumber(),
    hasMinimumLength(),
    disallowCharacters(),
  ]);

  readonly formControlConfirmpassword = new FormControl('', [
    Validators.required,
    isMatch(this.inputPassword),
    disallowCharacters(),
  ]);

  constructor() {
    // Firstname validation error updates
    merge(
      this.formControlFirstname.statusChanges,
      this.formControlFirstname.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateFirstnameErrorMessage());

    // Lastname validation error updates
    merge(
      this.formControlLastname.statusChanges,
      this.formControlLastname.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateLastnameErrorMessage());

    // Email validation error updates
    merge(
      this.formControlEmail.statusChanges,
      this.formControlEmail.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateEmailErrorMessage());

    // Age validation error updates
    merge(this.formControlAge.statusChanges, this.formControlAge.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateAgeErrorMessage());

    // Password validation error updates
    merge(
      this.formControlPassword.statusChanges,
      this.formControlPassword.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updatePasswordErrorMessage());

    // Confirm Password validation error updates
    merge(
      this.formControlConfirmpassword.statusChanges,
      this.formControlConfirmpassword.valueChanges
    )
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateConfirmPassswordErrorMessage());
  }

  updateFirstnameErrorMessage() {
    if (this.formControlFirstname.hasError('required')) {
      this.firstnameErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlFirstname.hasError('notMax100')) {
      this.firstnameErrorMessage.set(errorMessages.MAX100CHARACTERS);
    } else if (this.formControlFirstname.hasError('disallowedCharacters')) {
      this.firstnameErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  updateLastnameErrorMessage() {
    if (this.formControlLastname.hasError('required')) {
      this.lastnameErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlLastname.hasError('notMax100')) {
      this.lastnameErrorMessage.set(errorMessages.MAX100CHARACTERS);
    } else if (this.formControlLastname.hasError('disallowedCharacters')) {
      this.lastnameErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  updateEmailErrorMessage() {
    if (this.formControlEmail.hasError('required')) {
      this.emailErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlEmail.hasError('invalidEmailAddress')) {
      this.emailErrorMessage.set(errorMessages.INVALIDEMAIL);
    } else if (this.formControlEmail.hasError('disallowedCharacters')) {
      this.emailErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  updateAgeErrorMessage() {
    if (this.formControlAge.hasError('required')) {
      this.ageErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlAge.hasError('notNumeric')) {
      this.ageErrorMessage.set(errorMessages.ONLYNUMERICAL);
    } else if (this.formControlAge.hasError('notMax3')) {
      this.ageErrorMessage.set(errorMessages.MAX3NUMERIC);
    } else if (this.formControlAge.hasError('disallowedCharacters')) {
      this.ageErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  updatePasswordErrorMessage() {
    if (this.formControlPassword.hasError('required')) {
      this.passwordErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlPassword.hasError('noUppercase')) {
      this.passwordErrorMessage.set(errorMessages.HASUPPERCASE);
    } else if (this.formControlPassword.hasError('noLowercase')) {
      this.passwordErrorMessage.set(errorMessages.HASLOWERCASE);
    } else if (this.formControlPassword.hasError('noSpecialCharacter')) {
      this.passwordErrorMessage.set(errorMessages.HASSPECIALCHARACTER);
    } else if (this.formControlPassword.hasError('noNumber')) {
      this.passwordErrorMessage.set(errorMessages.HASNUMBER);
    } else if (this.formControlPassword.hasError('noMinimumLegnth')) {
      this.passwordErrorMessage.set(errorMessages.PASSWORDMINLENGTH);
    } else if (this.formControlPassword.hasError('disallowedCharacters')) {
      this.passwordErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  updateConfirmPassswordErrorMessage() {
    if (this.formControlConfirmpassword.hasError('required')) {
      this.confirmPasswordErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.formControlConfirmpassword.hasError('isNotMatch')) {
      this.confirmPasswordErrorMessage.set(errorMessages.PASSWORDNOTMATCH);
    } else if (
      this.formControlConfirmpassword.hasError('disallowedCharacters')
    ) {
      this.confirmPasswordErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    }
  }

  async signUpOnClick() {
    this.signingUp = true;
    try {
      const data = {
        firstname: this.inputFirstname,
        lastname: this.inputLastname,
        email: this.inputEmail,
        birthdate: this.inputBirthdate,
        password: this.inputPassword,
      };
      const isSuccess = await this.authService.signUp(data);
      if (isSuccess) {
        this.dialogRef.close();
        this.signingUp = false;
      } else {
        this.dialogRef.close();
        this.signingUp = false;
        console.log('Sign-in requires further confirmation.');
      }
    } catch (error) {
      this.signingUp = false;
      console.error('Sign-up failed:', error);
    } finally {
      this.signingUp = false;
    }
  }

  signInOnClick() {
    this.dialogRef.close();
    this.dialog
      .open(SigninComponent)
      .afterClosed()
      .subscribe((data) => {});
  }
}
