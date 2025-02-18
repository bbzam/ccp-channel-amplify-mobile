import { AfterViewInit, Component, ElementRef, inject, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
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
  @ViewChildren('video') videos!: QueryList<ElementRef>;
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

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting) {
            video.pause();
          } else {
            // Reset video to start and play when visible
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0 }
    );

    // Start observing each video
    this.videos.forEach((videoRef) => {
      observer.observe(videoRef.nativeElement);
    });
  }

  constructor() {}

  transform(value: number): string {
    if (isNaN(value) || value < 0) return '00:00:00';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.round(value % 60);

    let timeParts: string[] = [];

    if (hours > 0) {
      timeParts.push(`${hours}h`);
    }
    if (minutes > 0) {
      timeParts.push(`${minutes}m`);
    }
    if (seconds > 0 || timeParts.length === 0) {
      timeParts.push(`${seconds}s`);
    }

    return timeParts.join(' ');
  }

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
