import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { ccpspecial } from '../../../shared/mock-data';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-ccpspecial',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './ccpspecial.component.html',
  styleUrl: './ccpspecial.component.css',
})
export class CcpspecialComponent implements OnInit {
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];
  category: string = 'ccpspecials';

  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    this.getAllContents();
  }

  getAllContents() {
    this.featuresService.getAllContents(this.category, true).then((data: any) => {
      this.banners = data;
      this.featured = data;
    });
  }
}
