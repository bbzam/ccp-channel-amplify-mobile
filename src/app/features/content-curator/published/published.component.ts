import { Component, inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FeaturesService } from '../../features.service';

export interface Tab {
  label: string;
}

@Component({
  selector: 'app-published',
  imports: [MatTabsModule, AsyncPipe, MatTableModule],
  templateUrl: './published.component.html',
  styleUrl: './published.component.css',
})
export class PublishedComponent {
  readonly featuresService = inject(FeaturesService);
  asyncTabs: Observable<Tab[]>;
  tabsArray: Tab[] = [];
  columns = [
    { def: 'title', header: 'Title' },
    { def: 'category', header: 'Category' },
    { def: 'subCategory', header: 'Sub Category' },
    { def: 'description', header: 'Description' },
    { def: 'director', header: 'Director' },
    { def: 'writer', header: 'Writer' },
    { def: 'createdAt', header: 'Date Created' },
    { def: 'updatedAt', header: 'Last Modified' },
    { def: 'status', header: 'Status' },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  dataSource = [];

  ngOnInit(): void {
    this.getAllContents('');
  }

  constructor() {
    this.asyncTabs = new Observable((observer: Observer<Tab[]>) => {
      const tabs = [
        { label: 'THEATER' },
        { label: 'FILM' },
        { label: 'MUSIC' },
        { label: 'DANCE' },
        { label: 'EDUCATION' },
        { label: 'CCP SPECIALS' },
        { label: 'CCP CLASSICS' },
      ];
      observer.next(tabs);
      this.tabsArray = tabs; // Store the tabs array
    });
  }

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTabLabel = this.tabsArray[event.index].label;
    // Convert label to lowercase and remove spaces
    const category = selectedTabLabel.toLowerCase().replace(/\s+/g, '');

    this.getAllContents(category);
  }

  getAllContents(category: string) {
    this.featuresService.filterContent(category).then((data: any) => {
      if (data) {
        this.dataSource = data;
      }
    });
  }
}
