import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import { allFeatured } from '../../mock-data';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';

@Component({
  selector: 'app-featured',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.css',
})
export class FeaturedComponent implements AfterViewInit, OnInit {
  @Input() featured!: any[];
  readonly dialog = inject(MatDialog);
  items: any[] = allFeatured;

  visibleItems: any[] = [];
  startIndex: number = 0;
  itemsToShow: number = 5;

  ngOnInit(): void {
    this.updateVisibleItems();
    this.updateItemsToShow();
  }

  ngAfterViewInit(): void {}

  constructor() {}

  @HostListener('window:resize') updateItemsToShow(): void {
    const width = window.innerWidth;
    if (width <= 480) {
      this.itemsToShow = 1; // Mobile view
    } else if (width >= 481 && width <= 767) {
      this.itemsToShow = 2; // Small tablets to larger tablets
    } else if (width >= 768 && width <= 1119) {
      this.itemsToShow = 3; // Small desktop and larger tablets
    } else if (width >= 1120 && width <= 1439) {
      this.itemsToShow = 4; // Medium desktop
    } else if (width >= 1440 && width <= 1919) {
      this.itemsToShow = 5; // Large desktop
    } else if (width >= 1920) {
      this.itemsToShow = 6; // Ultra-wide desktop
    }
    this.updateVisibleItems();
  }

  moreInfo(item: any) {
    this.dialog
      .open(MoreInfoComponent, { data: { data: item } })
      .afterClosed()
      .subscribe((data) => {});
  }

  updateVisibleItems(): void {
    this.visibleItems = this.featured?.slice(
      this.startIndex,
      this.startIndex + this.itemsToShow
    );
  }

  nextPage(): void {
    if (this.startIndex + this.itemsToShow < this.featured.length) {
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
