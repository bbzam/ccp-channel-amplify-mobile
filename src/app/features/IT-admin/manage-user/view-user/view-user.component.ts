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
  emailValidator,
} from '../../../../shared/utils/validators';
import { MatDividerModule } from '@angular/material/divider';
import { FeaturesService } from '../../../features.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-view-user',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
  ],
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.css',
})
export class ViewUserComponent implements OnInit {
  readonly isLoading = signal(false);
  readonly isEditing = signal(false);
  editUserForm!: FormGroup;

  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<ViewUserComponent>);
  private readonly featuresService = inject(FeaturesService);
  private readonly fb = inject(FormBuilder);

  // Fields
  firstname!: string;
  lastname!: string;
  email!: string;
  email_verified!: string;
  birthdate!: string;
  role!: string;
  paidUntil!: string;
  Enabled!: boolean;
  UserStatus!: string;
  createdAt!: string;
  lastModified!: string;

  // Error message signals
  firstnameErrorMessage = signal('');
  lastnameErrorMessage = signal('');
  emailErrorMessage = signal('');
  birthdateErrorMessage = signal('');
  roleErrorMessage = signal('');
  paidUntilErrorMessage = signal('');

  // Form status computed value
  readonly formStatus = computed(() => ({
    isValid: this.editUserForm.valid,
    isDirty: this.editUserForm.dirty,
    isPristine: this.editUserForm.pristine,
  }));

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.firstname = data.given_name;
    this.lastname = data.family_name;
    this.email = data.email;
    this.birthdate = data.birthdate;
    this.role = data.role;
    this.paidUntil = data['custom:paidUntil']?.split(' ')[0] || '';
    this.Enabled = data.Enabled;
    this.UserStatus = data.UserStatus;
    this.createForm();
    this.setupValidationSubscriptions();
  }

  ngOnInit(): void {}

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  private createForm(): void {
    this.editUserForm = this.fb.group({
      firstname: [
        { value: this.firstname, disabled: !this.isEditing() },
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
      lastname: [
        { value: this.lastname, disabled: !this.isEditing() },
        [Validators.required, allowMax100(), disallowCharacters()],
      ],
      email: [
        { value: this.email, disabled: true },
        [Validators.required, emailValidator(), disallowCharacters()],
      ],
      birthdate: [
        { value: this.birthdate, disabled: !this.isEditing() },
        [Validators.required, disallowCharacters()],
      ],
      role: [
        { value: this.role, disabled: !this.isEditing() },
        [Validators.required, disallowCharacters()],
      ],
      paidUntil: [
        { value: this.paidUntil, disabled: !this.isEditing() },
        [disallowCharacters()],
      ],
    });

    // Watch for role changes
    this.editUserForm
      .get('role')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((role) => {
        const paidUntilControl = this.editUserForm.get('paidUntil');
        if (role === 'SUBSCRIBER') {
          paidUntilControl?.setValidators([
            Validators.required,
            disallowCharacters(),
          ]);
        } else {
          paidUntilControl?.setValidators([disallowCharacters()]);
        }
        paidUntilControl?.updateValueAndValidity();
      });
  }

  toggleEditMode() {
    this.isEditing.set(!this.isEditing());

    if (this.isEditing()) {
      this.editUserForm.enable();
      this.editUserForm.get('email')?.disable();
    } else {
      this.editUserForm.disable();
    }
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
      const control = this.editUserForm.get(controlName);
      if (control) {
        merge(control.statusChanges, control.valueChanges)
          .pipe(takeUntilDestroyed(), distinctUntilChanged())
          .subscribe(() => this.updateErrorMessage(controlName));
      }
    });
  }

  private updateErrorMessage(controlName: string): void {
    const control = this.editUserForm.get(controlName);
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

  async updateUserOnClick(): Promise<void> {
    if (this.editUserForm.invalid) return;

    this.isLoading.set(true);
    try {
      const formData = this.editUserForm.value;
      const data = {
        email: this.email,
        firstname: formData.firstname,
        lastname: formData.lastname,
        birthdate: formData.birthdate,
        role: formData.role,
        paidUntil:
          formData.role === 'SUBSCRIBER'
            ? `${formData.paidUntil} 00:00:00 UTC`
            : '',
      };
      const isSuccess = await this.featuresService.updateUser(data);
      this.dialogRef.close(true);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendInvitationOnClick(): Promise<void> {
    try {
      const data = {
        email: this.email,
      };
      const isSuccess = await this.featuresService.resendInvitation(data);
      this.dialogRef.close(true);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async disableOnClick(): Promise<void> {
    try {
      const data = {
        email: this.email,
      };
      const isSuccess = await this.featuresService.disableUser(data);
      this.dialogRef.close(true);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async enableOnClick(): Promise<void> {
    try {
      const data = {
        email: this.email,
      };
      const isSuccess = await this.featuresService.enableUser(data);
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
