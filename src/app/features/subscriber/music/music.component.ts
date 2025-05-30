import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';
import { SharedService } from '../../../shared/shared.service';

@Component({
  selector: 'app-music',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css',
})
export class MusicComponent implements OnInit {
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];
  allContents: any[] = [];
  category: string = 'music';

  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);

  ngOnInit(): void {
    this.getAllContents(this.category);
  }

  async getAllContents(currentTab: string) {
    try {
      // First get all contents
      const data = await this.featuresService.getAllContents(currentTab, true);

      // Process all content items to add presigned URLs
      this.allContents = await Promise.all(
        data.map(async (content: any) => {
          const [urlLandscape, urlPreviewVideo] = await Promise.all([
            this.featuresService.getFileUrl(content.landscapeImageUrl),
            this.featuresService.getFileUrl(content.previewVideoUrl),
          ]);

          return {
            ...content,
            landscapeImagePresignedUrl: urlLandscape,
            previewVideoPresignedUrl: urlPreviewVideo,
          };
        })
      );

      // Then get featured data and filter
      const featuredData = await this.sharedService.getFeaturedAll(currentTab);

      // Only process data if it matches the current category
      if (featuredData) {
        const selectedIds = featuredData[0].selectedContent.split(',');

        // Since we already have presigned URLs in allContents, we can use that data
        this.featured = selectedIds
          .map((id: string) =>
            this.allContents.find((item: any) => item.id === id)
          )
          .filter(Boolean);

        this.banners = this.featured;
      } else {
        // Reset if category doesn't match
        this.featured = [];
        this.banners = this.allContents;
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      this.banners = [];
      this.featured = [];
      this.allContents = [];
    }
  }
}
