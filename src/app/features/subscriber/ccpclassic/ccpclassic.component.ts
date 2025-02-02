import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-ccpclassic',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './ccpclassic.component.html',
  styleUrl: './ccpclassic.component.css',
})
export class CcpclassicComponent implements OnInit {
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];
  category: string = 'ccpclassics';

  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    this.getAllContents();
  }

  getAllContents() {
    this.featuresService.filterContent(this.category).then((data: any) => {
      this.banners = data;
      this.featured = data;
    });
  }
}
