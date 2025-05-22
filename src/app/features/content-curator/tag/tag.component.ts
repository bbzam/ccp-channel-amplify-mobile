import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from '../../../shared/component/table/table.component';
import { SharedService } from '../../../shared/shared.service';
import { ViewTagComponent } from '../view-tag/view-tag.component';

@Component({
  selector: 'app-tag',
  imports: [TableComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
})
export class TagComponent {
  readonly sharedService = inject(SharedService);
  readonly dialog = inject(MatDialog);

  columns = [
    { def: 'tag', header: 'Tag Name', sortable: true },
    { def: 'isVisible', header: 'Is Visible', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];
  keyword!: string;

  ngOnInit(): void {
    this.getAllTags(this.keyword);
  }

  getAllTags(keyword: string) {
    this.keyword = keyword;
    this.sharedService.getAllTags(keyword).then((data: any) => {
      if (data) {
        this.tableData = data;
      }
    });
  }

  handleRefreshClick() {
    this.getAllTags(this.keyword);
  }

  handleRowClick(row: any): void {
    this.dialog
      .open(ViewTagComponent, {
        data: row,
        panelClass: 'dialog',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getAllTags(this.keyword);
        }
      });
  }
}
