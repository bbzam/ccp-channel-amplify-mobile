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
  allContents: any[] = [];
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

      // Process all content items to add presigned URLs for portrait and preview video only
      this.allContents = await Promise.all(
        data.map(async (content: any) => {
          const [urlPortrait, urlPreviewVideo] = await Promise.all([
            this.featuresService.getFileUrl(content.portraitImageUrl),
            this.featuresService.getFileUrl(content.previewVideoUrl),
          ]);

          return {
            ...content,
            portraitImagePresignedUrl: urlPortrait,
            previewVideoPresignedUrl: urlPreviewVideo,
          };
        })
      );

      // Then get featured data and filter
      const featuredData = await this.sharedService.getFeaturedAll(currentTab);

      // Only process data if it matches the current category
      if (
        featuredData &&
        featuredData.length > 0 &&
        featuredData[0].selectedContent
      ) {
        const selectedIds = featuredData[0].selectedContent.split(',');

        // Get the featured items and add landscape image URLs only for them
        this.featured = await Promise.all(
          selectedIds
            .map((id: string) =>
              this.allContents.find((item: any) => item.id === id)
            )
            .filter(Boolean)
            .map(async (item: any) => {
              // Only get landscape image URL for featured items
              const urlLandscape = await this.featuresService.getFileUrl(
                item.landscapeImageUrl
              );
              return {
                ...item,
                landscapeImagePresignedUrl: urlLandscape,
              };
            })
        );

        this.banners = this.featured;
      } else {
        // Reset if category doesn't match
        this.featured = [];

        // For banners, we need to get landscape images for the first 5 items
        this.banners = await Promise.all(
          this.allContents.slice(0, 5).map(async (item: any) => {
            const urlLandscape = await this.featuresService.getFileUrl(
              item.landscapeImageUrl
            );
            return {
              ...item,
              landscapeImagePresignedUrl: urlLandscape,
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching content data:', error);
      this.banners = [];
      this.featured = [];
      this.allContents = [];
    }
  }
}
