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

  private allTabs: Tab[] = [
    { label: 'PAID SUBSCRIBERS', role: 'PAID_SUBSCRIBER' },
    { label: 'FREE SUBSCRIBERS', role: 'FREE_SUBSCRIBER' },
    { label: 'GUEST USERS', role: 'USER' },
    { label: 'CONTENT CURATORS', role: 'CONTENT_CREATOR' },
    { label: 'IT ADMINS', role: 'IT_ADMIN' },
    { label: 'SUPER ADMINS', role: 'SUPER_ADMIN' },
  ];

  tabs: Tab[] = [];

  columns = [
    { def: 'given_name', header: 'Firstname', sortable: true },
    { def: 'family_name', header: 'Lastname', sortable: true },
    { def: 'birthdate', header: 'Birthdate', sortable: true },
    { def: 'email', header: 'Email', sortable: true },
    { def: 'subscriptionType', header: 'Subscription Type', sortable: true },
    { def: 'custom:paidUntil', header: 'Subscribed Until', sortable: true },
    { def: 'email_verified', header: 'Email Verified', sortable: true },
    { def: 'Enabled', header: 'Status', sortable: true },
  ];

  get displayedColumns() {
    const excludeColumns =
      this.role === 'PAID_SUBSCRIBER'
        ? []
        : this.role === 'FREE_SUBSCRIBER'
        ? ['subscriptionType']
        : ['custom:paidUntil', 'subscriptionType'];

    return this.columns
      .filter((c) => !excludeColumns.includes(c.def))
      .map((c) => c.def);
  }

  tableData: any[] = [];

  ngOnInit(): void {
    this.setTabsBasedOnUserRole();
    this.role = 'PAID_SUBSCRIBER';
    this.getAllUsers(this.role);
  }

  private setTabsBasedOnUserRole(): void {
    const currentUserRole = sessionStorage.getItem('role');

    switch (currentUserRole) {
      case 'CONTENT_CREATOR':
        this.tabs = this.allTabs.filter((tab) =>
          ['USER', 'SUBSCRIBER'].includes(tab.role)
        );
        break;
      case 'IT_ADMIN':
        this.tabs = this.allTabs.filter((tab) =>
          ['USER', 'SUBSCRIBER', 'CONTENT_CREATOR'].includes(tab.role)
        );
        break;
      case 'SUPER_ADMIN':
        this.tabs = [...this.allTabs];
        break;
      default:
        this.tabs = [];
        break;
    }
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
        console.log(data);
      }
    });
  }

  handleRowClick(row: any): void {
    row.role =
      this.role === 'PAID_SUBSCRIBER' || this.role === 'FREE_SUBSCRIBER'
        ? 'SUBSCRIBER'
        : this.role;
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
