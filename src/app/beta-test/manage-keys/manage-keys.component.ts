import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableComponent } from '../../shared/component/table/table.component';
import { FeaturesService } from '../../features/features.service';

@Component({
  selector: 'app-manage-keys',
  imports: [TableComponent],
  templateUrl: './manage-keys.component.html',
  styleUrl: './manage-keys.component.css',
})
export class ManageKeysComponent {
  readonly featuresService = inject(FeaturesService);
  readonly dialog = inject(MatDialog);

  columns = [
    { def: 'id', header: 'ID', sortable: true },
    { def: 'isUsed', header: 'Is Used', sortable: true },
    { def: 'createdAt', header: 'Date Created', sortable: true },
    { def: 'updatedAt', header: 'Last Modified', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];

  ngOnInit(): void {
    this.getAllKeys();
  }

  getAllKeys() {
    this.featuresService.getAllKeys().then((data: any) => {
      if (data) {
        this.tableData = data;
      }
    });
  }

  handleRefreshClick() {
    this.getAllKeys();
  }
}
