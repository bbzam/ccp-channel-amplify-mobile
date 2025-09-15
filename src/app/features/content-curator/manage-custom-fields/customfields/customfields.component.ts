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
import { ViewCustomFieldComponent } from '../view-custom-field/view-custom-field.component';

@Component({
  selector: 'app-customfields',
  imports: [TableComponent, MatButtonModule, MatIconModule, DragDropModule],
  templateUrl: './customfields.component.html',
  styleUrl: './customfields.component.css',
})
export class CustomfieldsComponent {
  readonly sharedService = inject(SharedService);
  readonly dialog = inject(MatDialog);

  reorderMode = false;
  columns = [
    { def: 'fieldName', header: 'Field Name', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];
  keyword!: string;
  originalTableData: any[] = [];

  ngOnInit(): void {
    this.getAllCustomFields(this.keyword);
  }

  getAllCustomFields(keyword: string) {
    this.keyword = keyword;
    this.sharedService.getAllCustomFields(keyword).then((data: any) => {
      if (data) {
        this.tableData = data;
      }
    });
  }

  handleRefreshClick() {
    this.getAllCustomFields(this.keyword);
  }

  handleRowClick(row: any): void {
    if (this.reorderMode) return;

    this.dialog
      .open(ViewCustomFieldComponent, {
        data: row,
        panelClass: 'dialog',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getAllCustomFields(this.keyword);
        }
      });
  }

  async saveOrder() {
    await this.updateCustomFieldOrders();
    this.reorderMode = false;
  }

  onDrop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.tableData, event.previousIndex, event.currentIndex);
  }

  async updateCustomFieldOrders() {
    const updates = [];

    for (let i = 0; i < this.tableData.length; i++) {
      const currentField = this.tableData[i];
      const originalIndex = this.originalTableData.findIndex(
        (field) => field.id === currentField.id
      );

      if (originalIndex !== i) {
        updates.push({
          id: currentField.id,
          order: i + 1,
        });
      }
    }

    if (updates.length > 0) {
      await this.sharedService.batchUpdateCustomFields(updates);
    }
  }

  toggleReorderMode() {
    this.reorderMode = true;
    this.originalTableData = [...this.tableData];
  }

  cancelReorder() {
    this.tableData = [...this.originalTableData];
    this.reorderMode = false;
  }
}
