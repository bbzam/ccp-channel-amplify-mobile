import { Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

export interface ReminderDialogData {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  primaryMessage: string;
  secondaryMessage: string;
  actionMessage?: string;
  cancelText?: string;
  actionText?: string;
  actionType?: string;
}

@Component({
  selector: 'app-reminder-dialog',
  imports: [MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './reminder-dialog.component.html',
  styleUrl: './reminder-dialog.component.css',
})
export class ReminderDialogComponent {
  title: string;
  primaryMessage: string;
  secondaryMessage: string;
  actionMessage?: string;
  cancelText?: string;
  actionText?: string;
  actionType?: string;
  icon: string;
  iconClass: string;
  buttonColor: string;

  readonly dialogRe = inject(MatDialogRef<ReminderDialogComponent>);
  readonly router = inject(Router);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ReminderDialogData) {
    this.title = data.title;
    this.primaryMessage = data.primaryMessage;
    this.secondaryMessage = data.secondaryMessage;
    this.actionMessage = data.actionMessage;
    this.cancelText = data.cancelText || 'Okay';
    this.actionText = data.actionText;
    this.actionType = data.actionType;

    const typeConfig = {
      warning: { icon: 'warning', class: 'warning-icon', color: 'accent' },
      error: { icon: 'error', class: 'error-icon', color: 'warn' },
      info: { icon: 'info', class: 'info-icon', color: 'primary' },
      success: {
        icon: 'check_circle',
        class: 'success-icon',
        color: 'primary',
      },
    };

    const config = typeConfig[data.type];
    this.icon = config.icon;
    this.iconClass = config.class;
    this.buttonColor = config.color;
  }

  renewSubscriptionOnClick() {
    this.dialogRe.close(true);
  }

  cancelOnClick() {
    this.dialogRe.close(false);
  }
}
