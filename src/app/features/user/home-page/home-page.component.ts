import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesService } from '../../features.service';
import { subscribeNow } from '../../public-view/mock-data';
import { PaymentMethodsComponent } from '../payment-methods/payment-methods.component';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  banners = subscribeNow;
  readonly dialog = inject(MatDialog);
  readonly featuresService = inject(FeaturesService);

  get username(): string {
    return String(sessionStorage.getItem('username'));
  }

  async subscribeNowOnClick(rate: string) {
    this.dialog
      .open(PaymentMethodsComponent)
      .afterClosed()
      .subscribe(async (ProcId) => {
        if (ProcId) {
          const url = await this.featuresService.createPayment(rate, ProcId);

          if (url) {
            console.log('result', url);
            window.location.href = url;
          }
        }
      });
  }
}
