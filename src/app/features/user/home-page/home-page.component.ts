import { Component } from '@angular/core';
import { BannerComponent } from '../../public-view/public-banner/banner.component';
import { subscribeNow } from '../../public-view/mock-data';

@Component({
  selector: 'app-home-page',
  imports: [BannerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  banners: any[] = subscribeNow;
}
