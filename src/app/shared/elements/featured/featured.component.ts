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
  private hoverTimeouts = new Map<HTMLVideoElement, NodeJS.Timeout>();
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
            this.pauseVideo(video);
          } else {
            this.setupVideoHover(video);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    this.observeVideos();
    this.videos.changes.subscribe(() => this.observeVideos());
  }

  ngOnDestroy(): void {
    this.hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.hoverTimeouts.clear();
    this.observer?.disconnect();
  }

  private observeVideos(): void {
    this.videos.forEach((videoRef) => {
      this.observer?.observe(videoRef.nativeElement);
    });
  }

  private setupVideoHover(video: HTMLVideoElement): void {
    const card = video.closest('.card') as HTMLElement;

    if (video.dataset['hoverSetup']) return;
    video.dataset['hoverSetup'] = 'true';

    const handleMouseEnter = () => {
      if (!video.src && video.dataset['src']) {
        video.src = video.dataset['src'];
      }

      const timeout = setTimeout(() => {
        video.currentTime = 5;
        video.play().catch(() => {});
      }, 300);

      this.hoverTimeouts.set(video, timeout);
    };

    const handleMouseLeave = () => {
      const timeout = this.hoverTimeouts.get(video);
      if (timeout) {
        clearTimeout(timeout);
        this.hoverTimeouts.delete(video);
      }
      this.pauseVideo(video);
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
  }

  private pauseVideo(video: HTMLVideoElement): void {
    video.pause();
    video.currentTime = 0;
  }

  @HostListener('window:resize') updateItemsToShow(): void {
    const width = window.innerWidth;
    if (width <= 480) this.itemsToShow = 1;
    else if (width <= 767) this.itemsToShow = 2;
    else if (width <= 1119) this.itemsToShow = 3;
    else if (width <= 1439) this.itemsToShow = 4;
    else if (width <= 1919) this.itemsToShow = 5;
    else this.itemsToShow = 6;

    this.updateVisibleItems();
  }

  transform(value: number): string {
    if (isNaN(value) || value < 0) return '00:00:00';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = Math.round(value % 60);

    let timeParts: string[] = [];

    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}s`);

    return timeParts.join(' ');
  }

  moreInfo(item: any) {
    this.dialog
      .open(MoreInfoComponent, { data: { data: item } })
      .afterClosed()
      .subscribe(() => {});
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
