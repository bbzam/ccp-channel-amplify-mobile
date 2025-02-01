import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { theaters } from '../../../shared/mock-data';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-theater',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './theater.component.html',
  styleUrl: './theater.component.css',
})
export class TheaterComponent implements OnInit {
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];
  category: string = 'theater';

  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    this.getAllContents();
  }

  getAllContents() {
    this.featuresService.filterContent(this.category).then((data: any) => {
      console.log(data);

      this.banners = data;
      this.featured = data;
    });
  }
}
