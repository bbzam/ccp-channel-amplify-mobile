import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-methods',
  imports: [MatButtonModule, MatCardModule, MatIconModule, CommonModule],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.css',
})
export class PaymentMethodsComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentMethodsComponent>);
  selectedPaymentMethod = '';

  paymentMethods = [
    {
      value: 'GCSH',
      label: 'GCash',
      icon: 'account_balance_wallet',
      description: 'Pay with GCash mobile wallet',
    },
    {
      value: ' ',
      label: 'DragonPay',
      icon: 'credit_card',
      description: 'Pay with DragonPay gateway',
    },
  ];

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod = method;
  }

  onConfirm() {
    if (this.selectedPaymentMethod) {
      this.dialogRef.close(this.selectedPaymentMethod);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
