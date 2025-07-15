import { Component, inject } from '@angular/core';
import { FeaturesService } from '../../../features.service';
import { TableComponent } from '../../../../shared/component/table/table.component';
import { TabComponent } from '../../../../shared/component/tab/tab.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewUserComponent } from '../view-user/view-user.component';

export interface Tab {
  label: string;
  role: string;
}

@Component({
  selector: 'app-manage-users',
  imports: [TableComponent, TabComponent],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent {
  private readonly featuresService = inject(FeaturesService);
  private readonly dialog = inject(MatDialog);
  role!: string;
  keyword!: string;

  tabs: Tab[] = [
    { label: 'FREE USERS', role: 'USER' },
    { label: 'SUBSCRIBERS', role: 'SUBSCRIBER' },
    { label: 'CONTENT CURATORS', role: 'CONTENT_CREATOR' },
    { label: 'IT ADMINS', role: 'IT_ADMIN' },
    { label: 'SUPER ADMINS', role: 'SUPER_ADMIN' },
  ];

  columns = [
    { def: 'given_name', header: 'Firstname', sortable: true },
    { def: 'family_name', header: 'Lastname', sortable: true },
    { def: 'birthdate', header: 'Birthdate', sortable: true },
    { def: 'email', header: 'Email', sortable: true },
    { def: 'email_verified', header: 'Email Verified', sortable: true },
    { def: 'Enabled', header: 'Status', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];

  ngOnInit(): void {
    this.role = 'USER';
    this.getAllUsers(this.role);
  }

  onTabChanged(role: any): void {
    this.getAllUsers(role, '', this.keyword);
    this.role = role;
  }

  getAllUsers(role: string, limit?: string, keyword?: string) {
    this.keyword = keyword || '';
    this.featuresService.getAllUsers(role, limit, keyword).then((data: any) => {
      if (data) {
        this.tableData = data;
      }
    });
  }

  handleRowClick(row: any): void {
    row.role = this.role;
    this.dialog
      .open(ViewUserComponent, {
        data: row,
        panelClass: 'dialog',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getAllUsers(this.role, '', this.keyword);
        }
      });
  }

  handleRefreshClick() {
    this.getAllUsers(this.role, '', this.keyword);
  }
}
