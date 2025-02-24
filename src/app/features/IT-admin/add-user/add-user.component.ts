import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user',
  imports: [],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.css',
})
export class AddUserComponent {
  readonly dialogRef = inject(MatDialogRef);

  closeDialog(): void {
    this.dialogRef.close();
  }
}
