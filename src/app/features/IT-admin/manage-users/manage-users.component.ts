import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

export interface Tab {
  label: string;
}

@Component({
  selector: 'app-manage-users',
  imports: [MatTabsModule, AsyncPipe, MatTableModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent {
  asyncTabs: Observable<Tab[]>;
  columns = [
    { def: 'name', header: 'Name' },
    { def: 'email', header: 'Email' },
    { def: 'role', header: 'Role' },
    { def: 'createdAt', header: 'Date Created' },
    { def: 'modifiedAt', header: 'Last Modified' },
    { def: 'writer', header: 'Status' },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  dataSource = [];

  constructor() {
    this.asyncTabs = new Observable((observer: Observer<Tab[]>) => {
      observer.next([
        { label: 'USERS' },
        { label: 'SUBSCRIBERS' },
        { label: 'CONTENT CURATORs' },
        { label: 'IT ADMINs' },
        { label: 'SUPER ADMINs' },
      ]);
    });
  }
}
