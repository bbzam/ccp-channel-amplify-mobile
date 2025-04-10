import { Component, inject } from '@angular/core';
import { FeaturesService } from '../../features.service';
import { TableComponent } from '../../../shared/component/table/table.component';
import { TabComponent } from '../../../shared/component/tab/tab.component';
import { ViewContentComponent } from '../view-content/view-content.component';
import { MatDialog } from '@angular/material/dialog';

export interface Tab {
  label: string;
  category: string;
}

@Component({
  selector: 'app-published',
  imports: [TableComponent, TabComponent],
  templateUrl: './published.component.html',
  styleUrl: './published.component.css',
})
export class PublishedComponent {
  readonly featuresService = inject(FeaturesService);
  readonly dialog = inject(MatDialog);
  currentTab!: string;

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
    { def: 'description', header: 'Description', sortable: true },
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
    this.currentTab = 'theater';
  }

  onTabChanged(category: string): void {
    this.getAllContents(category);
    this.currentTab = category;
  }

  getAllContents(category: string, keyword?: string) {
    this.featuresService
      .getAllContents(category, true, [], keyword)
      .then((data: any) => {
        if (data) {
          this.tableData = data.updatedData;
        }
      });
  }

  handleRowClick(row: any): void {
    this.dialog
      .open(ViewContentComponent, {
        data: row,
        panelClass: 'dialog',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getAllContents(row.category);
        }
      });
  }

  handleRefreshClick() {
    this.getAllContents(this.currentTab);
  }
}
