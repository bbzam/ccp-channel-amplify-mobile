import { Component, inject, OnInit } from '@angular/core';
import { BannerComponent } from '../../../shared/elements/banner/banner.component';
import { RecommendedComponent } from '../../../shared/elements/recommended/recommended.component';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-favorites',
  imports: [BannerComponent, RecommendedComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css',
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  banners: any[] = [];

  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    this.loadFavorites();
  }

  async loadFavorites() {
    try {
      const data = await this.featuresService.getUserFavorites();

      this.favorites = await Promise.all(
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

      // Create banners from first 5 favorites
      this.banners = await Promise.all(
        this.favorites.slice(0, 5).map(async (item: any) => {
          const urlLandscape = await this.featuresService.getFileUrl(
            item.landscapeImageUrl
          );
          return {
            ...item,
            landscapeImagePresignedUrl: urlLandscape,
          };
        })
      );
    } catch (error) {
      console.error('Failed to load favorites:', error);
      this.favorites = [];
      this.banners = [];
    }
  }
}
