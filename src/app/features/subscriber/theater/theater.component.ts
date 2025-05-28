import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { theaters } from '../../../shared/mock-data';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';
import { SharedService } from '../../../shared/shared.service';

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

        const processedContents = await Promise.all(
          selectedIds.map((id: string) => {
            const content = data.find((item: any) => item.id === id);
            if (!content) return null;

            return Promise.all([
              this.featuresService.getFileUrl(content.landscapeImageUrl),
              this.featuresService.getFileUrl(content.previewVideoUrl),
            ]).then(([urlLandscape, urlPreviewVideo]) => {
              return {
                ...content,
                landscapeImagePresignedUrl: urlLandscape,
                previewVideoPresignedUrl: urlPreviewVideo,
              };
            });
          })
        );

        this.featured = processedContents.filter(Boolean);
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
