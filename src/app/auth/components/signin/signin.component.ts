import { Component, DestroyRef, inject, OnInit, signal, Input, Output, EventEmitter, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { SignupComponent } from '../signup/signup.component';
import { CommonModule } from '@angular/common';

// Simplified validators for mobile
const emailValidator = () => (control: any) => {
  const email = control.value;
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : { invalidEmailAddress: true };
};

const disallowCharacters = () => (control: any) => {
  const value = control.value;
  if (!value) return null;
  // Simple check for basic disallowed characters
  const disallowed = /[<>]/;
  return disallowed.test(value) ? { disallowedCharacters: true } : null;
};

const errorMessages = {
  REQUIRED: 'This field is required',
  DISALLOWEDCHARACTERS: 'Invalid characters detected',
  INVALIDEMAIL: 'Please enter a valid email address'
};

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();
  
  inputEmail!: string;
  inputPassword!: string;
  signingIn: boolean = false;
  isPasswordVisible = false;
  emailErrorMessage = signal('');
  passwordErrorMessage = signal('');

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private signupDialogRef: ComponentRef<SignupComponent> | null = null;

  signInForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, disallowCharacters(), emailValidator()]],
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
    } else if (control.hasError('invalidEmailAddress')) {
      errorSignal.set(errorMessages.INVALIDEMAIL);
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
        this.close();
      }
    } catch (error) {
    } finally {
      this.signingIn = false;
    }
  }

  resetPasswordOnClick() {
    alert('Password reset functionality coming soon!');
  }

  signUpOnClick(): void {
    this.close();
    this.openSignupDialog();
  }

  private openSignupDialog() {
    if (this.signupDialogRef) {
      this.signupDialogRef.destroy();
    }

    this.signupDialogRef = createComponent(SignupComponent, {
      environmentInjector: this.injector
    });

    this.signupDialogRef.instance.isVisible = true;
    this.signupDialogRef.instance.closeDialog.subscribe(() => {
      this.closeSignupDialog();
    });

    this.appRef.attachView(this.signupDialogRef.hostView);
    document.body.appendChild(this.signupDialogRef.location.nativeElement);
  }

  private closeSignupDialog() {
    if (this.signupDialogRef) {
      this.appRef.detachView(this.signupDialogRef.hostView);
      this.signupDialogRef.destroy();
      this.signupDialogRef = null;
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  close() {
    this.closeDialog.emit();
  }
}