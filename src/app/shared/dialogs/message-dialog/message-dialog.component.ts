import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MessageType = 'error' | 'success';

@Component({
  selector: 'app-message-dialog',
  imports: [CommonModule],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.css'
})
export class MessageDialogComponent {
  @Input() message: string = '';
  @Input() type: MessageType = 'error';
  @Input() isVisible: boolean = false;
  @Output() closeDialog = new EventEmitter<void>();

  get processedMessage(): string {
    return this.message.includes(':') 
      ? this.message.substring(this.message.indexOf(':') + 1).trim()
      : this.message;
  }

  getIcon(): string {
    return this.type === 'error' ? '⚠️' : '✅';
  }

  getTitle(): string {
    return this.type === 'error' ? 'Error Message' : 'Success Message';
  }

  close() {
    this.closeDialog.emit();
  }
}