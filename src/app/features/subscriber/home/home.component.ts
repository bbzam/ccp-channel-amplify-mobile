import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { FeaturedComponent } from '../../../shared/elements/featured/featured.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { ContinueWatchingComponent } from '../../../shared/elements/continue-watching/continue-watching.component';
import { NoVideoAvailableComponent } from '../../../shared/elements/no-video-available/no-video-available.component';
import { FeaturesService } from '../../features.service';
import { SharedService } from '../../../shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { SeeMoreComponent } from '../../../shared/dialogs/see-more/see-more.component';

@Component({
  selector: 'app-home',
  imports: [
    BannerComponent,
    FeaturedComponent,
    RecommendedComponent,
    ContinueWatchingComponent,
    NoVideoAvailableComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadEssentialContent();
    // Load all categories at once
    setTimeout(() => this.loadAllCategories(), 1000);
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
        this.featured = selectedIds
          .map((id: string) => data.find((content: any) => content.id === id))
          .filter(Boolean); // Remove undefined items
        this.banners = [...this.featured]; // Create a new array to ensure change detection
      }
    } catch (error) {
      console.error('Error fetching essential content:', error);
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
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  // Helper method to update category data
  private updateCategoryData(category: string, data: any[]) {
    switch (category) {
      case 'theater':
        this.theater = [...data];
        break;
      case 'film':
        this.film = [...data];
        break;
      case 'music':
        this.music = [...data];
        break;
      case 'dance':
        this.dance = [...data];
        break;
      case 'education':
        this.education = [...data];
        break;
      case 'ccpspecials':
        this.ccpspecials = [...data];
        break;
      case 'ccpclassics':
        this.ccpclassics = [...data];
        break;
    }
  }

  seeMoreOnClick(data: any, title: string) {
    this.dialog
      .open(SeeMoreComponent, {
        data: { data, title },
        panelClass: 'seemore-dialog',
        disableClose: true,
      })
      .afterClosed();
  }
}
