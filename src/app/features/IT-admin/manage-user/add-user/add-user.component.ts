import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
  emailValidator,
  minimumAge,
} from '../../../../shared/utils/validators';
import { MatDividerModule } from '@angular/material/divider';
import { FeaturesService } from '../../../features.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-user',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<AddUserComponent>);
  private readonly featuresService = inject(FeaturesService);
  private readonly fb = inject(FormBuilder);

  createUserForm!: FormGroup;
  readonly isLoading = signal(false);

  // Error message signals
  firstnameErrorMessage = signal('');
  lastnameErrorMessage = signal('');
  emailErrorMessage = signal('');
  birthdateErrorMessage = signal('');
  roleErrorMessage = signal('');
  paidUntilErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.createUserForm.valid,
    isDirty: this.createUserForm.dirty,
    isPristine: this.createUserForm.pristine,
  }));

  constructor() {
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  private createForm(): void {
    this.createUserForm = this.fb.group({
      firstname: [
        '',
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
      lastname: [
        '',
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
      email: [
        '',
        [Validators.required, emailValidator(), disallowCharacters()],
      ],
      birthdate: [
        '',
        [Validators.required, disallowCharacters(), minimumAge()],
      ],
      role: ['', [Validators.required, disallowCharacters()]],
      paidUntil: ['', [Validators.required, disallowCharacters()]],
    });
  }

  private setupValidationSubscriptions(): void {
    const controls = [
      'firstname',
      'lastname',
      'email',
      'birthdate',
      'role',
      'paidUntil',
    ];

    controls.forEach((controlName) => {
      const control = this.createUserForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.createUserForm.get(controlName);
    if (!control) return;

    const errorSignalMap: { [key: string]: any } = {
      firstname: this.firstnameErrorMessage,
      lastname: this.lastnameErrorMessage,
      email: this.emailErrorMessage,
      birthdate: this.birthdateErrorMessage,
      role: this.roleErrorMessage,
      paidUntil: this.paidUntilErrorMessage,
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
    } else if (control.hasError('notNumeric')) {
      signal.set(errorMessages.ONLYNUMERICAL);
    } else if (control.hasError('notMax3')) {
      signal.set(errorMessages.MAX3NUMERIC);
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

  async createUserOnClick(): Promise<void> {
    if (this.createUserForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.createUserForm.value;
      const data = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        birthdate: formData.birthdate,
        role: formData.role,
        paidUntil: `${formData.paidUntil} 00:00:00 UTC`,
      };

      const isSuccess = await this.featuresService.createUser(data);
      this.dialogRef.close();

      if (!isSuccess) {
      }
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  cancelButton() {
    this.dialogRef.close();
  }
}
