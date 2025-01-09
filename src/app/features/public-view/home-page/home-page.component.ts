import { Component, OnInit } from '@angular/core';
import { featuredImages, topFeatured } from '../mock-data';
import { MatButtonModule } from '@angular/material/button';
import { PublicBannerComponent } from '../public-banner/public-banner.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MatButtonModule, PublicBannerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  banners: any[] = topFeatured;

  ngOnInit(): void {
    sessionStorage.clear();
  }

  images = featuredImages;
}