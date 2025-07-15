import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
    MatIcon,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  customTags: { name: string; content: any[] }[] = [];
  banners: any[] = [];
  featured: any[] = [];
  recommended: any[] = [];
  continueWatching: any[] = [];

  theater: any[] = [];
  film: any[] = [];
  music: any[] = [];
  dance: any[] = [];
  education: any[] = [];
  ccpspecials: any[] = [];
  ccpclassics: any[] = [];

  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  ngOnInit(): void {
    setTimeout(() => this.loadEssentialContent(), 1000);
    setTimeout(() => this.loadAllCategories(), 1500);
  }

  async loadEssentialContent() {
    try {
      // First get only featured and banner content
      const data = await this.featuresService.getAllContents('', true);

      // Process featured data
      const featuredData = await this.sharedService.getFeaturedAll('all');
      if (
        featuredData &&
        featuredData.length > 0 &&
        featuredData[0].selectedContent
      ) {
        const selectedIds = featuredData[0].selectedContent.split(',');

        // Get content items and add presigned URLs
        const processedItems = await Promise.all(
          selectedIds.map((id: string) => {
            const content = data.find((item: any) => item.id === id);
            if (!content) return null;

            return Promise.all([
              this.featuresService.getFileUrl(content.landscapeImageUrl),
              this.featuresService.getFileUrl(content.portraitImageUrl),
              this.featuresService.getFileUrl(content.previewVideoUrl),
            ]).then(([urlLandscape, urlPortrait, urlPreviewVideo]) => {
              return {
                ...content,
                landscapeImagePresignedUrl: urlLandscape,
                portraitImagePresignedUrl: urlPortrait,
                previewVideoPresignedUrl: urlPreviewVideo,
              };
            });
          })
        );

        this.featured = processedItems.filter(Boolean);
        this.banners = [...this.featured]; // Create a new array to ensure change detection
      } else {
        // If no featured content, use first five items
        this.featured = [];

        // Get presigned URLs only for the first five items
        const firstFiveItems = data.slice(0, 5);
        const processedItems = await Promise.all(
          firstFiveItems.map((content: any) => {
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

        this.banners = processedItems;
      }

      // Process continue watching
      const getContentToUserData = await this.sharedService.getContinueWatch();

      if (getContentToUserData && getContentToUserData.length > 0) {
        const continueWatchingIds = getContentToUserData.map(
          (item: any) => item.contentId
        );

        // Get content items and add presigned URLs
        const processedItems = await Promise.all(
          continueWatchingIds.map((id: string) => {
            const content = data.find((item: any) => item.id === id);
            if (!content) return null;

            return Promise.all([
              this.featuresService.getFileUrl(content.portraitImageUrl),
              this.featuresService.getFileUrl(content.previewVideoUrl),
            ]).then(([urlPortrait, urlPreviewVideo]) => {
              return {
                ...content,
                portraitImagePresignedUrl: urlPortrait,
                previewVideoPresignedUrl: urlPreviewVideo,
                pauseTime: getContentToUserData.find(
                  (item: any) => item.contentId === id
                ).pauseTime,
              };
            });
          })
        );

        this.continueWatching = processedItems.filter(Boolean);
      }
    } catch (error) {
      this.banners = [];
      this.featured = [];
    }
  }

  async loadAllCategories() {
    try {
      // Get all content once
      const allData = await this.featuresService.getAllContents('', true);

      // Define categories to load
      const categories = [
        'theater',
        'film',
        'music',
        'dance',
        'education',
        'ccpspecials',
        'ccpclassics',
      ];

      // Process each category
      categories.forEach((category) => {
        // Filter data by category (case insensitive)
        const filteredData = allData.filter(
          (item: any) =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );

        // Update the category array
        this.updateCategoryData(category, filteredData);
      });

      await this.loadCustomTagCategories(allData);
    } catch (error) {}
  }

  async loadCustomTagCategories(allData: any[]) {
    try {
      // Get all tags from the service
      const tags = await this.sharedService.getAllTags('', true);

      if (tags && tags.length > 0) {
        // Process each tag that is visible
        const processedTags = await Promise.all(
          tags
            .filter((tagItem: any) => tagItem.isVisible) // Only include visible tags
            .map(async (tagItem: any) => {
              // Get the selected content IDs
              const selectedIds = tagItem.selectedContent
                ? tagItem.selectedContent.split(',')
                : [];

              // Process content with presigned URLs
              const tagContent = await Promise.all(
                selectedIds.map(async (id: any) => {
                  const content = allData.find((item) => item.id === id);
                  if (!content) return null;

                  return Promise.all([
                    this.featuresService.getFileUrl(content.portraitImageUrl),
                    this.featuresService.getFileUrl(content.previewVideoUrl),
                  ]).then(([urlPortrait, urlPreviewVideo]) => {
                    return {
                      ...content,
                      portraitImagePresignedUrl: urlPortrait,
                      previewVideoPresignedUrl: urlPreviewVideo,
                    };
                  });
                })
              );

              return {
                name: tagItem.tag,
                content: tagContent.filter(Boolean),
              };
            })
        );

        // Remove empty categories
        this.customTags = processedTags.filter((tag) => tag.content.length > 0);
      }
    } catch (error) {
      this.customTags = [];
    }
  }

  // Helper method to update category data
  private async updateCategoryData(category: string, data: any[]) {
    // Process presigned URLs for all items in the category
    const processedData = await Promise.all(
      data.map((content) => {
        return Promise.all([
          this.featuresService.getFileUrl(content.portraitImageUrl),
          this.featuresService.getFileUrl(content.previewVideoUrl),
        ]).then(([urlPortrait, urlPreviewVideo]) => {
          return {
            ...content,
            portraitImagePresignedUrl: urlPortrait,
            previewVideoPresignedUrl: urlPreviewVideo,
          };
        });
      })
    );

    // Update the appropriate category array
    switch (category) {
      case 'theater':
        this.theater = [...processedData.slice(0, 10)];
        break;
      case 'film':
        this.film = [...processedData.slice(0, 10)];
        break;
      case 'music':
        this.music = [...processedData.slice(0, 10)];
        break;
      case 'dance':
        this.dance = [...processedData.slice(0, 10)];
        break;
      case 'education':
        this.education = [...processedData.slice(0, 10)];
        break;
      case 'ccpspecials':
        this.ccpspecials = [...processedData.slice(0, 10)];
        break;
      case 'ccpclassics':
        this.ccpclassics = [...processedData.slice(0, 10)];
        break;
    }
  }

  seeMoreOnClick(category: any) {
    this.router.navigate([`/subscriber/${category}`]);
  }
}
