import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { TableComponent } from '../../../../shared/component/table/table.component';
import { SharedService } from '../../../../shared/shared.service';
import { ViewTagComponent } from '../view-tag/view-tag.component';

@Component({
  selector: 'app-tag',
  imports: [TableComponent, MatButtonModule, MatIconModule, DragDropModule],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.css',
})
export class TagComponent {
  readonly sharedService = inject(SharedService);
  readonly dialog = inject(MatDialog);

  reorderMode = false;
  columns = [
    { def: 'tag', header: 'Tag Name', sortable: true },
    { def: 'isVisible', header: 'Is Visible', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];
  keyword!: string;
  originalTableData: any[] = [];

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
    if (this.reorderMode) return;

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

  async saveOrder() {
    await this.updateTagOrders();
    this.reorderMode = false;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tableData, event.previousIndex, event.currentIndex);
  }

  async updateTagOrders() {
    const updates = [];

    for (let i = 0; i < this.tableData.length; i++) {
      const currentTag = this.tableData[i];
      const originalIndex = this.originalTableData.findIndex(
        (tag) => tag.id === currentTag.id
      );

      if (originalIndex !== i) {
        updates.push({
          id: currentTag.id,
          order: i + 1,
        });
      }
    }

    if (updates.length > 0) {
      await this.sharedService.batchUpdateTags(updates);
    }
  }

  toggleReorderMode() {
    this.reorderMode = true;
    this.originalTableData = [...this.tableData]; // Save original order
  }

  cancelReorder() {
    this.tableData = [...this.originalTableData]; // Restore original order
    this.reorderMode = false;
  }
}
