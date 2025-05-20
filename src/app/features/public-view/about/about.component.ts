import { Component } from '@angular/core';
import { aboutDetails } from '../../../core/footer/footer-contents';
import { BannerComponent } from '../public-banner/banner.component';

@Component({
  selector: 'app-about',
  imports: [BannerComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  banners: any[] = aboutDetails;
}
