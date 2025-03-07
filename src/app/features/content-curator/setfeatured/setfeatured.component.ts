import { Component, inject } from '@angular/core';
import { SetFeaturedComponent } from '../../../shared/component/set-featured/set-featured.component';
import { allFeatured, theaters } from '../../../shared/mock-data';
import { TabComponent } from '../../../shared/component/tab/tab.component';
import { FeaturesService } from '../../features.service';

export interface Tab {
  label: string;
  category: string;
}

@Component({
  selector: 'app-setfeatured',
  imports: [SetFeaturedComponent, TabComponent],
  templateUrl: './setfeatured.component.html',
  styleUrl: './setfeatured.component.css',
})
export class SetfeaturedComponent {
  readonly featuresService = inject(FeaturesService);
  contents: any[] = [];
  featured: any[] = [];
  tabs: Tab[] = [
    { label: 'ALL', category: '' },
    { label: 'THEATER', category: 'theater' },
    { label: 'FILM', category: 'film' },
    { label: 'MUSIC', category: 'music' },
    { label: 'DANCE', category: 'dance' },
    { label: 'EDUCATION', category: 'education' },
    { label: 'CCP SPECIALS', category: 'ccpspecials' },
    { label: 'CCP CLASSICS', category: 'ccpclassics' },
  ];

  ngOnInit(): void {
    this.getAllContents('');
  }

  onTabChanged(category: string): void {
    this.getAllContents(category);
  }

  getAllContents(category: string) {
    this.featuresService.getAllContents(category, true).then((data: any) => {
      if (data) {
        this.contents = data;
      }
    });
  }
}
