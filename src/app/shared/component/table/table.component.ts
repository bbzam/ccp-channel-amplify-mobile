import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ColumnConfig {
  def: string;
  header: string;
  sortable?: boolean;
}

export interface TableConfig {
  columns: ColumnConfig[];
  displayedColumns: string[];
}

@Component({
  selector: 'app-table',
  imports: [
    MatTabsModule,
    MatTableModule,
    MatInputModule,
    DatePipe,
    MatPaginatorModule,
    MatPaginator,
    MatSortModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() displayedColumns: string[] = [];
  @Output() rowClick = new EventEmitter<any>();
  @Output() refreshClick = new EventEmitter<void>();
  @Output() getContent = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private searchTimeout: any;
  dataSource!: MatTableDataSource<any>;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: any) {
    if (changes.data && this.dataSource) {
      this.dataSource.data = changes.data.currentValue;
    }
  }

  applyFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    console.log(value);

    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout
    this.searchTimeout = setTimeout(() => {
      this.getContent.emit(value);
    }, 500); // .5 second delay
  }

  // applyFilter(event: Event) {
  //   const target = event.target as HTMLInputElement;
  //   const value = target.value;
  //   console.log(value);
  //   this.getContent.emit(value);
  // }

  truncateText(text: string, limit: number = 20): string {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onRefreshClick() {
    this.refreshClick.emit();
  }
}
