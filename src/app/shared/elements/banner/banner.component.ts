import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Input,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FeaturesService } from '../../../features/features.service';

@Component({
  selector: 'app-banner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @Input() banners!: any[];
  readonly featuresService = inject(FeaturesService);
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  currentMediaIndex: number = 0;
  showPhoto: boolean = true;
  teaserDuration!: number;

  ngAfterViewInit(): void {
    this.autoPlayMedia();
  }

  ngOnInit(): void {}

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
    // // Get presigned URL directly
    // this.featuresService
    //   .getFileUrl(item.portraitImageUrl)
    //   .then((urlPortrait) => {
    //     const updatedItem = {
    //       ...item,
    //       portraitImagePresignedUrl: urlPortrait,
    //     };

    this.dialog
      .open(MoreInfoComponent, { data: { data: item } })
      .afterClosed()
      .subscribe((data) => {});
    // });
  }

  autoPlayMedia() {
    // Preload only the next video in sequence
    const preloadNextVideo = (index: number) => {
      const nextIndex = (index + 1) % this.banners.length;
      const videoUrl = this.banners[nextIndex].previewVideoPresignedUrl;

      if (videoUrl) {
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

    const updateMedia = () => {
      const currentMedia = this.banners[this.currentMediaIndex];

      if (this.showPhoto) {
        this.showPhoto = false;
        // Preload the next banner while showing video
        preloadNextVideo(this.currentMediaIndex);
      } else {
        this.showPhoto = true;
        this.currentMediaIndex =
          (this.currentMediaIndex + 1) % this.banners.length;
      }

      // Use requestAnimationFrame for better performance
      const timeout = this.showPhoto ? 5000 : this.teaserDuration || 5000;
      setTimeout(() => requestAnimationFrame(updateMedia), timeout);
    };

    // Start with preloading the first video
    preloadNextVideo(this.currentMediaIndex);
    setTimeout(() => requestAnimationFrame(updateMedia), 5000);
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
