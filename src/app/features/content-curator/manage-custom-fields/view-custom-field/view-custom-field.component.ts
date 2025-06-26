import {
  Component,
  Inject,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { distinctUntilChanged, merge } from 'rxjs';
import { errorMessages } from '../../../../shared/utils/errorMessages';
import {
  allowMax100,
  disallowCharacters,
} from '../../../../shared/utils/validators';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedService } from '../../../../shared/shared.service';

@Component({
  selector: 'app-view-custom-field',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './view-custom-field.component.html',
  styleUrl: './view-custom-field.component.css',
})
export class ViewCustomFieldComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly isEditing = signal(false);
  editCustomFieldForm!: FormGroup;

  private readonly dialogRef = inject(MatDialogRef<ViewCustomFieldComponent>);
  private readonly sharedService = inject(SharedService);
  private readonly fb = inject(FormBuilder);

  // Fields
  fieldName!: string;

  // Error message signals
  fieldNameErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.editCustomFieldForm.valid,
    isDirty: this.editCustomFieldForm.dirty,
    isPristine: this.editCustomFieldForm.pristine,
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.fieldName = data.fieldName;
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  private createForm(): void {
    this.editCustomFieldForm = this.fb.group({
      fieldName: [
        { value: this.fieldName, disabled: !this.isEditing() },
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
    });
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing());

    if (this.isEditing()) {
      this.editCustomFieldForm.enable();
    } else {
      this.editCustomFieldForm.disable();
    }
  }

  private setupValidationSubscriptions(): void {
    const fieldNameControl = this.editCustomFieldForm.get('fieldName');

    if (fieldNameControl) {
      merge(fieldNameControl.statusChanges, fieldNameControl.valueChanges)
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateFieldNameErrorMessage());
    }
  }

  private updateFieldNameErrorMessage(): void {
    const control = this.editCustomFieldForm.get('fieldName');
    if (!control) return;

    if (control.hasError('required')) {
      this.fieldNameErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('notMax100')) {
      this.fieldNameErrorMessage.set(errorMessages.MAX100CHARACTERS);
    } else if (control.hasError('disallowedCharacters')) {
      this.fieldNameErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.fieldNameErrorMessage.set('');
    }
  }

  async updateCustomFieldOnClick(): Promise<void> {
    if (this.editCustomFieldForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.editCustomFieldForm.value;
      const data = {
        id: this.data.id,
        fieldName: formData.fieldName,
      };
      const isSuccess = await this.sharedService.updateCustomField(data);
      this.dialogRef.close(true);
    } catch (error) {
      console.error('Update custom field failed:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // async deleteCustomField(): Promise<void> {
  //   this.isLoading.set(true);
  //   try {
  //     const isSuccess = await this.sharedService.deleteCustomField(
  //       this.data.id
  //     );
  //     this.dialogRef.close(true);
  //   } catch (error) {
  //     console.error('Delete custom field failed:', error);
  //   } finally {
  //     this.isLoading.set(false);
  //   }
  // }

  cancelButton() {
    this.dialogRef.close(false);
  }
}
