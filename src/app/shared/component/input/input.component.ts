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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { distinctUntilChanged } from 'rxjs';
import { disallowCharacters } from '../../utils/validators';
import { errorMessages } from '../../utils/errorMessages';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-input',
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
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
})
export class InputComponent implements OnInit {
  @Input() content: any;
  private readonly dialogRef = inject(MatDialogRef<InputComponent>);
  private readonly fb = inject(FormBuilder);

  // Form and state management
  inputForm!: FormGroup;
  readonly isLoading = signal(false);
  readonly inputErrorMessage = signal('');

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.content = data;
    this.createForm();
    this.setupValidation();
  }

  ngOnInit(): void {}

  // Create and initialize the form
  private createForm(): void {
    this.inputForm = this.fb.group({
      input: ['', [Validators.required, disallowCharacters()]],
    });
  }

  // Setup form validation subscription
  private setupValidation(): void {
    const inputControl = this.inputForm.get('input');

    if (inputControl) {
      inputControl.valueChanges
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateInputErrorMessage());
    }
  }

  // Update error message based on validation state
  private updateInputErrorMessage(): void {
    const control = this.inputForm.get('input');
    if (!control) return;

    if (control.hasError('required')) {
      this.inputErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('disallowedCharacters')) {
      this.inputErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.inputErrorMessage.set('');
    }
  }

  async submit(): Promise<void> {
    if (this.inputForm.invalid) return;

    this.isLoading.set(true);
    try {
      const input = this.inputForm.get('input')?.value;
      this.dialogRef.close(input);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }
}
