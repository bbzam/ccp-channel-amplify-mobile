import { Component, OnInit } from '@angular/core';
import { aboutDetails, featuredImages, topFeatured } from '../mock-data';
import { MatButtonModule } from '@angular/material/button';
import { BannerComponent } from '../public-banner/banner.component';
import { allFeatured } from '../../../shared/mock-data';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, BannerComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  banners: any[] = topFeatured;
  images = featuredImages;
  allFeatured = allFeatured;
  aboutDetails = aboutDetails;

  ngOnInit(): void {}

}
