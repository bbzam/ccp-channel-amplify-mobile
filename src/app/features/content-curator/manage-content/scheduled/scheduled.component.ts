import { Component, inject } from '@angular/core';
import { FeaturesService } from '../../../features.service';
import { TableComponent } from '../../../../shared/component/table/table.component';
import { TabComponent } from '../../../../shared/component/tab/tab.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewContentComponent } from '../view-content/view-content.component';

export interface Tab {
  label: string;
  category: string;
}

@Component({
  selector: 'app-scheduled',
  imports: [TableComponent, TabComponent],
  templateUrl: './scheduled.component.html',
  styleUrl: './scheduled.component.css',
})
export class ScheduledComponent {
  readonly featuresService = inject(FeaturesService);
  readonly dialog = inject(MatDialog);
  currentTab!: string;
  keyword!: string;

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
    this.currentTab = 'theater';
  }

  onTabChanged(category: string): void {
    this.getAllContents(category, this.keyword);
    this.currentTab = category;
  }

  getAllContents(category: string, keyword?: string) {
    this.keyword = keyword || '';
    this.featuresService
      .getAllContents(category, false, [], keyword)
      .then((data: any) => {
        if (data) {
          this.tableData = data;
        }
      });
  }

  handleRowClick(row: any): void {
    Promise.all([
      this.featuresService.getFileUrl(row.landscapeImageUrl),
      this.featuresService.getFileUrl(row.portraitImageUrl),
      this.featuresService.getFileUrl(row.previewVideoUrl),
      this.featuresService.getFileUrl(row.fullVideoUrl),
    ]).then(([urlLandscape, urlPortrait, urlPreviewVideo, urlFullVideo]) => {
      const updatedRow = {
        ...row,
        landscapeImagePresignedUrl: urlLandscape,
        portraitImagePresignedUrl: urlPortrait,
        previewVideoPresignedUrl: urlPreviewVideo,
        fullVideoPresignedUrl: urlFullVideo,
      };

      this.dialog
        .open(ViewContentComponent, {
          data: updatedRow,
          panelClass: 'dialog',
          disableClose: true,
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.getAllContents(row.category);
          }
        });
    });
  }

  handleRefreshClick() {
    this.getAllContents(this.currentTab, this.keyword);
  }
}
