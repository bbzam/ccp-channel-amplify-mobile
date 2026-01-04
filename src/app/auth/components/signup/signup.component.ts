import { Component, inject, signal, computed, Input, Output, EventEmitter, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, merge } from 'rxjs';
import { SigninComponent } from '../signin/signin.component';
import { VerifyAccountComponent } from '../verify-account/verify-account.component';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import {
  allowMax100,
  disallowCharacters,
  emailValidator,
  hasLowercase,
  hasMinimumLength,
  hasNumber,
  hasSpecialCharacter,
  hasUppercase,
  isMatch,
  minimumAge,
} from '../../../shared/utils/validators';
import { errorMessages } from '../../../shared/utils/errorMessages';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  @Input() isVisible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private signinDialogRef: ComponentRef<SigninComponent> | null = null;
  private verifyDialogRef: ComponentRef<VerifyAccountComponent> | null = null;

  signupForm!: FormGroup;
  readonly isLoading = signal(false);
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  // Error message signals
  firstnameErrorMessage = signal('');
  lastnameErrorMessage = signal('');
  emailErrorMessage = signal('');
  birthdateErrorMessage = signal('');
  passwordErrorMessage = signal('');
  confirmPasswordErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.signupForm?.valid || false,
    isDirty: this.signupForm?.dirty || false,
    isPristine: this.signupForm?.pristine || true,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
  }

  private createForm(): void {
    // Try to restore saved form data
    const savedData = this.getSavedFormData();
    
    this.signupForm = this.fb.group({
      firstname: [savedData.firstname || '', [Validators.required, allowMax100(), disallowCharacters()]],
      lastname: [savedData.lastname || '', [Validators.required, allowMax100(), disallowCharacters()]],
      email: [savedData.email || '', [Validators.required, emailValidator(), disallowCharacters()]],
      birthdate: [savedData.birthdate || '', [Validators.required, disallowCharacters(), minimumAge()]],
      password: [savedData.password || '', [
        Validators.required,
        hasUppercase(),
        hasLowercase(),
        hasSpecialCharacter(),
        hasNumber(),
        hasMinimumLength(),
        disallowCharacters(),
      ]],
      confirmPassword: [savedData.confirmPassword || '', [Validators.required, disallowCharacters()]],
    });

    // Password matching validator
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      confirmPasswordControl.addValidators(isMatch(passwordControl));
    }
    
    // Save form data on every change
    this.signupForm.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.saveFormData();
    });
  }

  private setupValidationSubscriptions(): void {
    const controls = ['firstname', 'lastname', 'email', 'birthdate', 'password', 'confirmPassword'];

    controls.forEach((controlName) => {
      const control = this.signupForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });

    // Update confirm password validation when password changes
    const passwordControl = this.signupForm.get('password');
    const confirmPasswordControl = this.signupForm.get('confirmPassword');

    if (passwordControl && confirmPasswordControl) {
      passwordControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
        confirmPasswordControl.updateValueAndValidity();
      });
    }
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.signupForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      firstname: this.firstnameErrorMessage,
      lastname: this.lastnameErrorMessage,
      email: this.emailErrorMessage,
      birthdate: this.birthdateErrorMessage,
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
    } else if (control.hasError('underAge')) {
      signal.set(errorMessages.UNDERAGE);
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

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  async signUp(): Promise<void> {
    if (this.signupForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.signupForm.value;
      const data = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        birthdate: formData.birthdate,
        password: formData.password,
      };

      const isSuccess = await this.authService.signUp(data);
      if (isSuccess) {
        // Clear saved data on successful signup
        this.clearSavedFormData();
        this.close();
        // Open verify account modal
        this.openVerifyDialog(formData.email, formData.email);
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private saveFormData(): void {
    const formData = this.signupForm.value;
    // Don't save passwords for security
    const dataToSave = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      birthdate: formData.birthdate,
      password: '', // Don't persist passwords
      confirmPassword: ''
    };
    sessionStorage.setItem('signup_draft', JSON.stringify(dataToSave));
  }

  private getSavedFormData(): any {
    const saved = sessionStorage.getItem('signup_draft');
    return saved ? JSON.parse(saved) : {};
  }

  private clearSavedFormData(): void {
    sessionStorage.removeItem('signup_draft');
  }

  signInOnClick() {
    this.close();
    this.openSigninDialog();
  }

  private openSigninDialog() {
    if (this.signinDialogRef) {
      this.signinDialogRef.destroy();
    }

    this.signinDialogRef = createComponent(SigninComponent, {
      environmentInjector: this.injector
    });

    this.signinDialogRef.instance.isVisible = true;
    this.signinDialogRef.instance.closeDialog.subscribe(() => {
      this.closeSigninDialog();
    });

    this.appRef.attachView(this.signinDialogRef.hostView);
    document.body.appendChild(this.signinDialogRef.location.nativeElement);
  }

  private closeSigninDialog() {
    if (this.signinDialogRef) {
      this.appRef.detachView(this.signinDialogRef.hostView);
      this.signinDialogRef.destroy();
      this.signinDialogRef = null;
    }
  }

  private openVerifyDialog(destination: string, username: string) {
    if (this.verifyDialogRef) {
      this.verifyDialogRef.destroy();
    }

    this.verifyDialogRef = createComponent(VerifyAccountComponent, {
      environmentInjector: this.injector
    });

    this.verifyDialogRef.instance.destination = destination;
    this.verifyDialogRef.instance.username = username;
    this.verifyDialogRef.instance.isVisible = true;
    this.verifyDialogRef.instance.closeDialog.subscribe(() => {
      this.closeVerifyDialog();
    });

    this.appRef.attachView(this.verifyDialogRef.hostView);
    document.body.appendChild(this.verifyDialogRef.location.nativeElement);
  }

  private closeVerifyDialog() {
    if (this.verifyDialogRef) {
      this.appRef.detachView(this.verifyDialogRef.hostView);
      this.verifyDialogRef.destroy();
      this.verifyDialogRef = null;
    }
  }

  close() {
    this.closeDialog.emit();
  }
}