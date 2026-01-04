import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message-dialog',
  imports: [CommonModule],
  templateUrl: './error-message-dialog.component.html',
  styleUrl: './error-message-dialog.component.css'
})
export class ErrorMessageDialogComponent {
  message: string;

  constructor(
    public dialogRef: MatDialogRef<ErrorMessageDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Extract message after colon like web app
    this.message = data.message.includes(':') 
      ? data.message.substring(data.message.indexOf(':') + 1).trim()
      : data.message;
  }

  close() {
    this.dialogRef.close(false);
  }
}