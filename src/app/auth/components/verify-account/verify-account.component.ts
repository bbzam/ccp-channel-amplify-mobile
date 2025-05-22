import {
  Component,
  Inject,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { distinctUntilChanged, merge } from 'rxjs';
import {
  allowMax6,
  allowOnlyNumeric,
  disallowCharacters,
} from '../../../shared/utils/validators';
import { errorMessages } from '../../../shared/utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../auth-service.service';
import { VerifyAccountData } from '../../models/verify.model';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-verify-account',
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
    MatTooltip,
  ],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css',
})
export class VerifyAccountComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<VerifyAccountComponent>);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthServiceService);
  private readonly fb = inject(FormBuilder);

  // Input properties
  @Input() destination!: string;
  @Input() username!: string;

  // Form and state management
  verifyForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly codeErrorMessage = signal('');

  constructor(@Inject(MAT_DIALOG_DATA) private data: VerifyAccountData) {
    this.initializeData();
    this.createForm();
    this.setupValidation();
  }

  ngOnInit(): void {}

  // Initialize component data from dialog input
  private initializeData(): void {
    this.destination = this.data.destination;
    this.username = this.data.username;
  }

  // Create and initialize the form
  private createForm(): void {
    this.verifyForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          allowOnlyNumeric(),
          disallowCharacters(),
          allowMax6(),
        ],
      ],
    });
  }

  // Setup form validation subscription
  private setupValidation(): void {
    const codeControl = this.verifyForm.get('code');

    if (codeControl) {
      codeControl.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateCodeErrorMessage());
    }
  }

  // Update error message based on validation state
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
      const isSuccess = await this.authService.confirmSignUp(
        this.username,
        code
      );
      console.log(isSuccess);

      if (isSuccess) {
        this.dialogRef.close(true);
      }
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendCode(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.resendSignUpCode(this.username);
    } catch (error) {
      console.error('Resend code failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  close() {
    this.dialogRef.close();
  }
}
