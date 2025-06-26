import { Component, inject } from '@angular/core';
import { SetFeaturedComponent } from '../../../../shared/component/set-featured/set-featured.component';
import { FeaturesService } from '../../../features.service';
import { SharedService } from '../../../../shared/shared.service';
import { TabComponent } from '../../../../shared/component/tab/tab.component';

export interface Tab {
  label: string;
  category: string;
}

export interface ContentItem {
  id: string;
  title: string;
  selectedContent?: string;
}

@Component({
  selector: 'app-configure-landing-page',
  imports: [SetFeaturedComponent, TabComponent],
  templateUrl: './configure-landing-page.component.html',
  styleUrl: './configure-landing-page.component.css',
})
export class ConfigureLandingPageComponent {
  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);
  hasChanges: boolean = false;
  contents: ContentItem[] = [];
  featured: ContentItem[] = [];
  featuredData: ContentItem[] = [];
  featuredIds: string[] = [];
  currentTab!: string;
  tabs: Tab[] = [
    { label: 'MAIN BANNER', category: 'mainbanner' },
    { label: 'FEATURED 5 POSTERS', category: 'banners' },
    { label: 'FEATURED 12 BANNERS', category: 'posters' },
  ];

  async ngOnInit(): Promise<void> {
    this.currentTab = this.tabs[0].category;
    await this.getAllContents(this.currentTab === 'all' ? '' : this.currentTab); // Wait for contents to load first
    await this.getAllFeatured(this.currentTab); // Then get featured
  }

  async onTabChanged(category: string): Promise<void> {
    this.hasChanges = false;
    this.currentTab = category;
    await this.getAllContents(category === 'all' ? '' : category);
    await this.getAllFeatured(category);
  }

  getAllContents(category: string, keyword?: string) {
    const fields = ['id', 'title'];
    return this.featuresService
      .getAllContents(category, true, fields, keyword)
      .then((data: any) => {
        if (data) {
          this.contents = data;
        }
      });
  }

  async getAllFeatured(currentTab: string) {
    try {
      const data = await this.sharedService.getFeaturedAll(currentTab);

      // Only process data if it matches the current category
      if (data[0]?.selectedContent && data[0]?.category === currentTab) {
        const selectedIds = data[0].selectedContent.split(',');

        this.featuredData = data;
        this.featured = selectedIds.map((id: string) => {
          const matchingContent = this.contents.find(
            (content) => content.id === id
          );

          return {
            id,
            title: matchingContent?.title || '',
          };
        });
        console.log(this.featured);
      } else {
        // Reset if category doesn't match
        this.featured = [];
        this.featuredData = [];
      }
    } catch (error) {
      console.error('Error fetching featured data:', error);
      this.featured = [];
      this.featuredData = [];
    }
  }

  onItemsChanged(event: { options: ContentItem[]; contents: ContentItem[] }) {
    this.featured = event.options;
    this.contents = event.contents;
    this.featuredIds = this.featured.map((item) => item.id);
    this.hasChanges = true;
  }

  async saveFeaturedContent() {
    const data: any = {
      category: this.currentTab,
      selectedContent: this.featured
        .filter((item) => item && item.id)
        .map((item) => item.id)
        .join(','),
    };

    try {
      if (this.featuredData[0] && this.featuredData.length) {
        data.id = this.featuredData[0]?.id;
        await this.sharedService.updateFeaturedAll(data);
      } else {
        await this.sharedService.addFeaturedAll(data);
      }

      this.hasChanges = false;
    } catch (error) {
      console.error('Error saving featured content:', error);
    }
  }
}
