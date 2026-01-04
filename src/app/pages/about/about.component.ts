import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../core/header/header.component';
import { FooterComponent } from '../../core/footer/footer.component';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { Router, NavigationEnd } from '@angular/router';
import { aboutDetails } from '../../core/footer/footer-contents';
import { filter } from 'rxjs';

@Component({
  selector: 'app-about',
  imports: [HeaderComponent, FooterComponent, BannerComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  private router = inject(Router);
  banners: any[] = aboutDetails;

  constructor() {
    // Scroll to top on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}