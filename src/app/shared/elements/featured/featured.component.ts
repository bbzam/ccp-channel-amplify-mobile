import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { Router } from '@angular/router';
import { FeaturesService } from '../../../features/features.service';

@Component({
  selector: 'app-featured',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.css',
})
export class FeaturedComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChildren('video') videos!: QueryList<ElementRef>;
  @Input() featured!: any[];
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly featuresService = inject(FeaturesService);

  visibleItems: any[] = [];
  startIndex: number = 0;
  itemsToShow: number = 8;
  private observer: IntersectionObserver | null = null;
  isFirefox: boolean = false;

  ngOnInit(): void {
    this.isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    this.updateVisibleItems();
    this.updateItemsToShow();
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;

          if (!entry.isIntersecting) {
            video.pause();
            video.currentTime = 0;
          } else {
            // Only load video when needed
            if (!video.src && entry.target.getAttribute('data-src')) {
              video.src = entry.target.getAttribute('data-src')!;
            }

            setTimeout(() => {
              video.currentTime = 5;
              video.play().catch(() => {});
            }, 2000); // 2s delay
          }
        });
      },
      { threshold: 0 }
    );

    // Start observing each video
    this.videos.forEach((videoRef) => {
      this.observer?.observe(videoRef.nativeElement);
    });

    // Handle changes to the videos QueryList
    this.videos.changes.subscribe((videos: QueryList<ElementRef>) => {
      videos.forEach((videoRef) => {
        this.observer?.observe(videoRef.nativeElement);
      });
    });
  }

  ngOnDestroy(): void {
    // Clean up the observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  constructor() {}

  // Rest of the component code remains unchanged
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
