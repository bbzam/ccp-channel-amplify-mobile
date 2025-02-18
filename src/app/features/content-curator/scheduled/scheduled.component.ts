import { Component } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

export interface Tab {
  label: string;
}

@Component({
  selector: 'app-scheduled',
  imports: [MatTabsModule, AsyncPipe, MatTableModule],
  templateUrl: './scheduled.component.html',
  styleUrl: './scheduled.component.css',
})
export class ScheduledComponent {
  asyncTabs: Observable<Tab[]>;
  columns = [
    { def: 'title', header: 'Title' },
    { def: 'category', header: 'Category' },
    { def: 'subcategory', header: 'Sub Category' },
    { def: 'description', header: 'Description' },
    { def: 'director', header: 'Director' },
    { def: 'writer', header: 'Writer' },
    { def: 'createdAt', header: 'Date Created' },
    { def: 'modifiedAt', header: 'Last Modified' },
    { def: 'writer', header: 'Status' },
  ];

  displayedColumns = this.columns.map((c) => c.def);
  dataSource = []; 

  constructor() {
    this.asyncTabs = new Observable((observer: Observer<Tab[]>) => {
      observer.next([
        { label: 'THEATER' },
        { label: 'FILM' },
        { label: 'MUSIC' },
        { label: 'DANCE' },
        { label: 'EDUCATION' },
        { label: 'CCP SPECIALS' },
        { label: 'CCP CLASSICS' },
      ]);
    });
  }
}
