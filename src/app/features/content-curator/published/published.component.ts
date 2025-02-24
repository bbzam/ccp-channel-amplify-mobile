import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { FeaturesService } from '../../features.service';
import { MatInputModule } from '@angular/material/input';
import { TableComponent } from '../../../shared/component/table/table.component';
import { TabComponent } from '../../../shared/component/tab/tab.component';

export interface Tab {
  label: string;
  category: string;
}

@Component({
  selector: 'app-published',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    TableComponent,
    TabComponent,
  ],
  templateUrl: './published.component.html',
  styleUrl: './published.component.css',
})
export class PublishedComponent {
  readonly featuresService = inject(FeaturesService);

  tabs: Tab[] = [
    { label: 'THEATER', category: 'theater' },
    { label: 'FILM', category: 'film' },
    { label: 'MUSIC', category: 'music' },
    { label: 'DANCE', category: 'dance' },
    { label: 'EDUCATION', category: 'education' },
    { label: 'CCP SPECIALS', category: 'ccpspecials' },
    { label: 'CCP CLASSICS', category: 'ccpclassics' },
  ];

  columns = [
    { def: 'title', header: 'Title', sortable: true },
    { def: 'category', header: 'Category', sortable: true },
    { def: 'subCategory', header: 'Sub Category', sortable: true },
    // { def: 'description', header: 'Description', sortable: true },
    { def: 'director', header: 'Director', sortable: true },
    { def: 'writer', header: 'Writer', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
    { def: 'status', header: 'Status', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];

  ngOnInit(): void {
    this.getAllContents('theater');
  }

  onTabChanged(category: string): void {
    this.getAllContents(category);
  }

  getAllContents(category: string) {
    this.featuresService.getAllContents(category, true).then((data: any) => {
      if (data) {
        this.tableData = data;
      }
    });
  }
}
