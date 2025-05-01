import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { allFeatured } from '../../mock-data';
import { MatCardModule } from '@angular/material/card';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recommended',
  imports: [MatCardModule, MatIcon],
  templateUrl: './recommended.component.html',
  styleUrl: './recommended.component.css',
})
export class RecommendedComponent implements AfterViewInit, OnInit {
  @ViewChildren('video') videos!: QueryList<ElementRef>;
  @Input() recommended!: any[];
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  visibleItems: any[] = [];
  startIndex: number = 0;
  itemsToShow: number = 5;

  ngOnInit(): void {
    this.updateVisibleItems();
    this.updateItemsToShow();
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
    this.visibleItems = this.recommended?.slice(
      this.startIndex,
      this.startIndex + this.itemsToShow
    );
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
