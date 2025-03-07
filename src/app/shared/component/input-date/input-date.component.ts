import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { distinctUntilChanged, merge } from 'rxjs';
import { disallowCharacters } from '../../utils/validators';
import { errorMessages } from '../../utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-input-date',
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
  templateUrl: './input-date.component.html',
  styleUrl: './input-date.component.css',
})
export class InputDateComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<InputDateComponent>);
  private readonly fb = inject(FormBuilder);

  // Form and state management
  betaAccessForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly dateErrorMessage = signal('');

  constructor() {
    this.createForm();
    this.setupValidation();
  }

  ngOnInit(): void {}

  // Create and initialize the form
  private createForm(): void {
    this.betaAccessForm = this.fb.group({
      date: ['', [Validators.required, disallowCharacters()]],
    });
  }

  // Setup form validation subscription
  private setupValidation(): void {
    const dateControl = this.betaAccessForm.get('date');

    if (dateControl) {
      dateControl.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateCodeErrorMessage());
    }
  }

  // Update error message based on validation state
  private updateCodeErrorMessage(): void {
    const control = this.betaAccessForm.get('date');
    if (!control) return;

    if (control.hasError('required')) {
      this.dateErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('disallowedCharacters')) {
      this.dateErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.dateErrorMessage.set('');
    }
  }

  async confirm(): Promise<void> {
    this.isLoading.set(true);
    if (this.betaAccessForm.invalid) return;

    try {
      const date = this.betaAccessForm.get('date')?.value;
      this.dialogRef.close(date);
      this.isLoading.set(false);
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
