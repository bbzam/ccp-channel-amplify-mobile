import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import { allFeatured } from '../../mock-data';
import { MatCardModule } from '@angular/material/card';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-recommended',
  imports: [MatCardModule, MatIcon],
  templateUrl: './recommended.component.html',
  styleUrl: './recommended.component.css',
})
export class RecommendedComponent implements AfterViewInit, OnInit{

  @Input() recommended!:any[];
  readonly dialog = inject(MatDialog);

  visibleItems: any[] = [];
  startIndex: number = 0;
  itemsToShow: number = 5;

  ngOnInit(): void {
    this.updateVisibleItems();
  }

  ngAfterViewInit(): void {
      
  }

  constructor() {
  }

  moreInfo(item:any) {
    this.dialog.open(MoreInfoComponent, {data: { data: item}}).afterClosed().subscribe(data => {

    })
  }

  updateVisibleItems(): void {
    this.visibleItems = this.recommended?.slice(this.startIndex, this.startIndex + this.itemsToShow);
  }

  nextPage(): void {
    if (this.startIndex + this.itemsToShow < this.recommended.length) {
      this.startIndex++;
      this.updateVisibleItems();
    }
  }

  prevPage(): void {
    if (this.startIndex > 0) {
      this.startIndex--;
      this.updateVisibleItems();
    }
  }
}
