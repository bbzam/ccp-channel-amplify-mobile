import { Component, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { allFeatured } from '../../../shared/mock-data';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';

@Component({
  selector: 'app-subscriber',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent
  ],
  templateUrl: './subscriber.component.html',
  styleUrl: './subscriber.component.css',
})
export class SubscriberComponent implements OnInit {
  banners: any[] = allFeatured;
  featured: any[] = allFeatured;
  recommended: any[] = [];
  continueWatching: any[] = [];

  ngOnInit(): void {}
}
