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
  FormControl,
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
import { merge } from 'rxjs';
import {
  allowOnlyNumeric,
  disallowCharacters,
} from '../../../shared/utils/validators';
import { errorMessages } from '../../../shared/utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthServiceService } from '../../auth-service.service';

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
  ],
  templateUrl: './verify-account.component.html',
  styleUrl: './verify-account.component.css',
})
export class VerifyAccountComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<VerifyAccountComponent>);
  readonly router = inject(Router);
  readonly authService = inject(AuthServiceService);
  @Input() destination!: string;
  @Input() username!: string;
  code!: string;
  confirming: boolean = false;
  codeErrorMessage = signal('');

  ngOnInit(): void {}

  // Form Controls
  readonly codeControl = new FormControl('', [
    Validators.required,
    allowOnlyNumeric,
    disallowCharacters(),
  ]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.destination = this.data.destination;
    this.username = this.data.username;
    // Code validation error updates
    merge(this.codeControl.statusChanges, this.codeControl.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateCodeErrorMessage());
  }

  updateCodeErrorMessage() {
    if (this.codeControl.hasError('required')) {
      this.codeErrorMessage.set(errorMessages.REQUIRED);
    } else if (this.codeControl.hasError('disallowedCharacters')) {
      this.codeErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else if (this.codeControl.hasError('notNumeric')) {
      this.codeErrorMessage.set(errorMessages.ONLYNUMERICAL);
    } else {
      this.codeErrorMessage.set('');
    }
  }

  async confirm() {
    this.confirming = true;
    try {
      const isSuccess = await this.authService.confirmSignUp(
        this.username,
        this.code
      );
      if (isSuccess) {
        this.dialogRef.close(true);
        this.confirming = false;
      } else {
        this.confirming = false;
      }
    } catch (error) {
      this.confirming = false;
      console.error('Confirm failed:', error);
    } finally {
      this.confirming = false;
    }
  }

  async resendCodeOnClick() {
    try {
      await this.authService.resendSignUpCode(this.username);
    } catch (error) {}
  }
}
