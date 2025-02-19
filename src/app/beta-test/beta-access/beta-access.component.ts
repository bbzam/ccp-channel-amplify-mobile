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
} from '../../shared/utils/validators';
import { errorMessages } from '../../shared/utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../auth/auth-service.service';
import { BetaAccessService } from '../beta-access.service';
import { FeaturesService } from '../../features/features.service';

@Component({
  selector: 'app-beta-access',
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
  templateUrl: './beta-access.component.html',
  styleUrl: './beta-access.component.css',
})
export class BetaAccessComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<BetaAccessComponent>);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthServiceService);
  private readonly betaAccessService = inject(BetaAccessService);
  private readonly fb = inject(FormBuilder);
  private readonly featuresService = inject(FeaturesService);

  // Form and state management
  betaAccessForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly codeErrorMessage = signal('');

  constructor() {
    this.createForm();
    this.setupValidation();
  }

  ngOnInit(): void {}

  // Create and initialize the form
  private createForm(): void {
    this.betaAccessForm = this.fb.group({
      code: ['', [Validators.required, disallowCharacters()]],
    });
  }

  // Setup form validation subscription
  private setupValidation(): void {
    const codeControl = this.betaAccessForm.get('code');

    if (codeControl) {
      codeControl.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateCodeErrorMessage());
    }
  }

  // Update error message based on validation state
  private updateCodeErrorMessage(): void {
    const control = this.betaAccessForm.get('code');
    if (!control) return;

    if (control.hasError('required')) {
      this.codeErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('disallowedCharacters')) {
      this.codeErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.codeErrorMessage.set('');
    }
  }

  async confirm(): Promise<void> {
    if (this.betaAccessForm.invalid) return;

    this.isLoading.set(true);
    try {
      const code = this.betaAccessForm.get('code')?.value;
      // const result = await this.betaAccessService.validateCode(code);
      const result = await this.featuresService.updateKeys(code);
      console.log(result?.errors?.[0]?.errorType);

      if (!result?.errors?.[0]?.errorType) {
        this.dialogRef.close(true);
      } else {
        this.authService.handleError('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
