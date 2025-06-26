import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from '../../../../shared/component/table/table.component';
import { SharedService } from '../../../../shared/shared.service';
import { ViewCustomFieldComponent } from '../view-custom-field/view-custom-field.component';

@Component({
  selector: 'app-customfields',
  imports: [TableComponent],
  templateUrl: './customfields.component.html',
  styleUrl: './customfields.component.css',
})
export class CustomfieldsComponent {
  readonly sharedService = inject(SharedService);
  readonly dialog = inject(MatDialog);

  columns = [
    { def: 'fieldName', header: 'Field Name', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];
  keyword!: string;

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
}
