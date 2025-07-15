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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-view-tag',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './view-tag.component.html',
  styleUrl: './view-tag.component.css',
})
export class ViewTagComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly isEditing = signal(false);
  editTagForm!: FormGroup;

  private readonly dialogRef = inject(MatDialogRef<ViewTagComponent>);
  private readonly sharedService = inject(SharedService);
  private readonly fb = inject(FormBuilder);

  // Fields
  tag!: string;
  isVisible!: boolean;

  // Error message signals
  tagErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.editTagForm.valid,
    isDirty: this.editTagForm.dirty,
    isPristine: this.editTagForm.pristine,
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.tag = data.tag;
    this.isVisible = data.isVisible;
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  private createForm(): void {
    this.editTagForm = this.fb.group({
      tag: [
        { value: this.tag, disabled: !this.isEditing() },
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
      isVisible: [{ value: this.isVisible, disabled: !this.isEditing() }],
    });
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing());

    if (this.isEditing()) {
      this.editTagForm.enable();
    } else {
      this.editTagForm.disable();
    }
  }

  private setupValidationSubscriptions(): void {
    const control = this.editTagForm.get('tag');
    if (control) {
      merge(control.statusChanges, control.valueChanges)
        .pipe(takeUntilDestroyed(), distinctUntilChanged())
        .subscribe(() => this.updateErrorMessage());
    }
  }

  private updateErrorMessage(): void {
    const control = this.editTagForm.get('tag');
    if (!control) return;

    if (control.hasError('required')) {
      this.tagErrorMessage.set(errorMessages.REQUIRED);
    } else if (control.hasError('notMax100')) {
      this.tagErrorMessage.set(errorMessages.MAX100CHARACTERS);
    } else if (control.hasError('disallowedCharacters')) {
      this.tagErrorMessage.set(errorMessages.DISALLOWEDCHARACTERS);
    } else {
      this.tagErrorMessage.set('');
    }
  }

  async updateTagOnClick(): Promise<void> {
    if (this.editTagForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.editTagForm.value;
      const data = {
        id: this.data.id,
        tag: formData.tag,
        isVisible: formData.isVisible,
      };
      const isSuccess = await this.sharedService.updateTag(data);
      this.dialogRef.close(true);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteTag(): Promise<void> {
    this.isLoading.set(true);
    try {
      const isSuccess = await this.sharedService.deleteTag(this.data.id);
      this.dialogRef.close(true);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelButton() {
    this.dialogRef.close(false);
  }
}
