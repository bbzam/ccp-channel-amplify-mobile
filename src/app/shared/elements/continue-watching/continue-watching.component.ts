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
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FeaturesService } from '../../../features/features.service';

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
  readonly featuresService = inject(FeaturesService);

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
    this.featuresService.getFileUrl(videoUrl).then((presignedUrl) => {
      this.router.navigate(['subscriber/video-player'], {
        queryParams: { videoUrl: presignedUrl },
      });
    });
  }

  moreInfo(item: any) {
    // Get presigned URL directly
    this.featuresService
      .getFileUrl(item.portraitImageUrl)
      .then((urlPortrait) => {
        const updatedItem = {
          ...item,
          portraitImagePresignedUrl: urlPortrait,
        };

        this.dialog
          .open(MoreInfoComponent, { data: { data: updatedItem } })
          .afterClosed()
          .subscribe((data) => {});
      });
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
