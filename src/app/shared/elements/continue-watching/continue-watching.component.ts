import { AfterViewInit, Component, inject, Input, OnInit } from '@angular/core';
import { allFeatured } from '../../mock-data';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-continue-watching',
  imports: [MatCardModule, MatIcon],
  templateUrl: './continue-watching.component.html',
  styleUrl: './continue-watching.component.css',
})
export class ContinueWatchingComponent implements AfterViewInit, OnInit {
  @Input() continueWatching!: any[];
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  items: any[] = allFeatured;

  visibleItems: any[] = [];
  startIndex: number = 0;
  itemsToShow: number = 5;

  ngOnInit(): void {
    this.updateVisibleItems();
  }

  ngAfterViewInit(): void {}

  constructor() {}

  watchVideo(videoUrl: string) {
    this.router.navigate(['subscriber/video-player'], {
      queryParams: { videoUrl },
    });
  }

  moreInfo(item: any) {
    this.dialog
      .open(MoreInfoComponent, { data: { data: item } })
      .afterClosed()
      .subscribe((data) => {});
  }

  updateVisibleItems(): void {
    this.visibleItems = this.continueWatching?.slice(
      this.startIndex,
      this.startIndex + this.itemsToShow
    );
  }

  nextPage(): void {
    if (this.startIndex + this.itemsToShow < this.continueWatching.length) {
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
