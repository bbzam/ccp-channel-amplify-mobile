import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'app-education',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './education.component.html',
  styleUrl: './education.component.css',
})
export class EducationComponent implements OnInit {
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];
  category: string = 'education';

  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);

  ngOnInit(): void {
    this.getAllContents(this.category);
  }

  async getAllContents(currentTab: string) {
    try {
      // First get all contents
      const data = await this.featuresService.getAllContents(currentTab, true);

      // Then get featured data and filter
      const featuredData = await this.sharedService.getFeaturedAll(currentTab);

      // Only process data if it matches the current category
      if (featuredData) {
        const selectedIds = featuredData[0].selectedContent.split(',');

        this.featured = selectedIds.map((id: string) => {
          const matchingContent = data.find(
            (content: any) => content.id === id
          );

          return matchingContent;
        });
        this.banners = this.featured;
      } else {
        // Reset if category doesn't match
        this.featured = [];
        this.banners = [];
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      this.banners = [];
      this.featured = [];
    }
  }
}
