import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  inject,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FeaturesService } from '../../../features/features.service';
import { Subscription } from 'rxjs';
import { VideoPlayerService } from '../../component/video-player/video-player.service';

@Component({
  selector: 'app-banner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('bannerContainer') bannerContainer!: ElementRef<HTMLDivElement>;
  @Input() banners!: any[];
  readonly featuresService = inject(FeaturesService);
  readonly videoPlayerService = inject(VideoPlayerService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  currentMediaIndex: number = 0;
  showPhoto: boolean = true;
  teaserDuration!: number;
  private observer: IntersectionObserver | null = null;
  private timeoutId: any = null;
  private isVisible: boolean = true;
  private isDialogOpen: boolean = false;
  private dialogSubscription: Subscription | null = null;

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
    this.setupDialogListener();
    this.autoPlayMedia();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (document.hidden) {
      this.pauseMedia();
    } else if (!this.isDialogOpen) {
      this.resumeMedia();
    }
  }

  setupDialogListener(): void {
    this.dialogSubscription = this.dialog.afterOpened.subscribe(() => {
      this.isDialogOpen = true;
      this.pauseMedia();
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.isDialogOpen = false;
      if (this.isVisible && !document.hidden) {
        this.resumeMedia();
      }
    });
  }

  pauseMedia(): void {
    // Pause video playback
    if (this.videoElement?.nativeElement && !this.showPhoto) {
      this.videoElement.nativeElement.pause();
    }
    // Pause the autoplay loop
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  resumeMedia(): void {
    // Resume video playback
    if (this.videoElement?.nativeElement && !this.showPhoto) {
      this.videoElement.nativeElement.play().catch(() => {});
    }
    // Resume the autoplay loop if it was paused
    if (!this.timeoutId) {
      this.continueAutoPlayMedia();
    }
  }

  setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting;

        if (this.isVisible && !document.hidden && !this.isDialogOpen) {
          this.resumeMedia();
        } else {
          this.pauseMedia();
        }
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );

    if (this.bannerContainer) {
      this.observer.observe(this.bannerContainer.nativeElement);
    }
  }

  // Rest of the component remains unchanged
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

  watchVideo(videoUrl: string, thumbnailUrl: string, id: string) {
    const promises = [this.featuresService.getFileUrl(videoUrl)];
    if (thumbnailUrl) {
      promises.push(this.featuresService.getFileUrl(thumbnailUrl));
    }

    Promise.all(promises).then((results) => {
      const [videoPresignedUrl, thumbnailPresignedUrl] = results;

      // Store data in service
      this.videoPlayerService.setVideoData({
        videoUrl: videoPresignedUrl,
        ...(thumbnailUrl && { thumbnailUrl: thumbnailPresignedUrl }),
        vttUrl: thumbnailUrl,
        id: id,
      });

      this.router.navigate(['subscriber/video-player']);
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

  autoPlayMedia() {
    // Preload only the next video in sequence
    const preloadNextVideo = (index: number) => {
      const nextIndex = (index + 1) % this.banners.length;
      const videoUrl = this.banners[nextIndex].previewVideoPresignedUrl;

      if (videoUrl && videoUrl !== 'undefined' && videoUrl.trim() !== '') {
        const preloadVideo = document.createElement('video');
        preloadVideo.preload = 'metadata';
        preloadVideo.src = videoUrl;

        // Remove after metadata is loaded to free memory
        preloadVideo.addEventListener('loadedmetadata', () => {
          this.teaserDuration = preloadVideo.duration * 1000;
          preloadVideo.src = '';
        });
      }
    };

    this.continueAutoPlayMedia(preloadNextVideo);
  }

  continueAutoPlayMedia(preloadNextVideoFn?: (index: number) => void) {
    if (!this.isVisible || document.hidden || this.isDialogOpen) return;

    const updateMedia = () => {
      if (!this.isVisible || document.hidden || this.isDialogOpen) return;

      const currentMedia = this.banners[this.currentMediaIndex];

      if (this.showPhoto) {
        this.showPhoto = false;
        // Preload the next banner while showing video
        if (preloadNextVideoFn) {
          preloadNextVideoFn(this.currentMediaIndex);
        }
      } else {
        this.showPhoto = true;
        this.currentMediaIndex =
          (this.currentMediaIndex + 1) % this.banners.length;
      }

      // Use requestAnimationFrame for better performance
      const timeout = this.showPhoto ? 5000 : this.teaserDuration || 5000;
      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        if (this.isVisible && !document.hidden && !this.isDialogOpen) {
          requestAnimationFrame(updateMedia);
        }
      }, timeout);
    };

    // Start with preloading the first video if function provided
    if (preloadNextVideoFn) {
      preloadNextVideoFn(this.currentMediaIndex);
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      if (this.isVisible && !document.hidden && !this.isDialogOpen) {
        requestAnimationFrame(updateMedia);
      }
    }, 5000);
  }

  getVideoDuration(): number {
    const videoElement = document.createElement('video');
    videoElement.src =
      this.banners[this.currentMediaIndex].previewVideoPresignedUrl;

    // Listen for the loadedmetadata event to ensure duration is available
    if (this.banners[this.currentMediaIndex].previewVideoPresignedUrl) {
      videoElement.addEventListener('loadedmetadata', () => {
        this.teaserDuration = videoElement.duration * 1000; // Duration in milliseconds
      });
    } else {
      this.teaserDuration = 0;
    }

    return this.teaserDuration;
  }
}
