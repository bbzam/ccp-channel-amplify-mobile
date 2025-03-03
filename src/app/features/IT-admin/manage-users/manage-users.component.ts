import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { FeaturesService } from '../../features.service';
import { MatInputModule } from '@angular/material/input';
import { TableComponent } from '../../../shared/component/table/table.component';
import { TabComponent } from '../../../shared/component/tab/tab.component';

export interface Tab {
  label: string;
  role: string;
}

@Component({
  selector: 'app-manage-users',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    TableComponent,
    TabComponent,
  ],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent {
  readonly featuresService = inject(FeaturesService);

  tabs: Tab[] = [
    { label: 'USERS', role: 'USERS' },
    { label: 'SUBSCRIBERS', role: 'SUBSCRIBERS' },
    { label: 'CONTENT CURATORS', role: 'CONTENT_CREATOR' },
    { label: 'IT ADMINS', role: 'IT_ADMIN' },
    { label: 'SUPER ADMINS', role: 'SUPER_ADMIN' },
  ];

  columns = [
    { def: 'given_name', header: 'Firstname', sortable: true },
    { def: 'family_name', header: 'Lastname', sortable: true },
    { def: 'role', header: 'Role', sortable: true },
    { def: 'birthdate', header: 'Birthdate', sortable: true },
    { def: 'email', header: 'Email', sortable: true },
    { def: 'email_verified', header: 'Email Verified', sortable: true },
    { def: 'status', header: 'Status', sortable: true },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  tableData: any[] = [];

  ngOnInit(): void {
    this.getAllUsers('USERS');
  }

  onTabChanged(role: string): void {
    this.getAllUsers(role);
  }

  getAllUsers(role: string) {
    this.featuresService.getAllUsers().then((data: any) => {
      if (data) {
        console.log(data);
        
        this.tableData = data;
      }
    });
  }
}
