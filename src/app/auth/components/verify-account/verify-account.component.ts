import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../auth.service';
import { SigninComponent } from '../signin/signin.component';
import { CommonModule } from '@angular/common';
import { 
  allowMax6, 
  allowOnlyNumeric, 
  disallowCharacters 
} from '../../../shared/utils/validators';
import { errorMessages } from '../../../shared/utils/errorMessages';

@Component({
  selector: 'app-verify-account',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css'
})
export class VerifyAccountComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  @Input() destination: string = '';
  @Input() username: string = '';
  @Input() isVisible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  verifyForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly resendCooldown = signal(0);
  readonly codeErrorMessage = signal('');

  get email(): string {
    return this.destination;
  }

  constructor() {
    this.createForm();
    this.setupValidation();
  }

  private createForm(): void {
    this.verifyForm = this.fb.group({
      code: ['', [
        Validators.required,
        allowOnlyNumeric(),
        disallowCharacters(),
        allowMax6()
      ]]
    });
  }

  private setupValidation(): void {
    const codeControl = this.verifyForm.get('code');
    
    if (codeControl) {
      codeControl.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateCodeErrorMessage());
    }
  }

  private updateCodeErrorMessage(): void {
    const control = this.verifyForm.get('code');
    if (!control) return;

    if (control.hasError('required')) {
      this.codeErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('disallowedCharacters')) {
      this.codeErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else if (control.hasError('notMax6')) {
      this.codeErrorMessage.set(errorMessages.MAX6CHARACTERS);
    } else if (control.hasError('notNumeric')) {
      this.codeErrorMessage.set(errorMessages.ONLYNUMERICAL);
    } else {
      this.codeErrorMessage.set('');
    }
  }

  async confirm(): Promise<void> {
    if (this.verifyForm.invalid) return;

    this.isLoading.set(true);
    try {
      const code = this.verifyForm.get('code')?.value;
      const isSuccess = await this.authService.confirmSignUp(this.username, code);
      
      if (isSuccess) {
        this.authService.handleSuccess('Sign-up Completed! Please sign in to continue.');
        this.close();
        // TODO: Open signin modal with vanilla implementation
      }
    } catch (error) {
      console.error('Verification error:', error);
      this.authService.handleError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendCode(): Promise<void> {
    if (this.resendCooldown() > 0) return;

    this.isLoading.set(true);
    try {
      await this.authService.resendConfirmationCode(this.username);
      this.authService.handleSuccess('Verification code sent!');
      this.startCooldown();
    } catch (error) {
      console.error('Resend error:', error);
      this.authService.handleError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private startCooldown(): void {
    this.resendCooldown.set(60);
    const interval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        clearInterval(interval);
        this.resendCooldown.set(0);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  close() {
    // Clear pending verification when user manually closes
    this.authService.clearPendingVerification();
    this.closeDialog.emit();
  }
}