import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  Input,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';
import { ShakaPlayerService } from '../../shaka-player.service';

@Component({
  selector: 'app-video-player',
  imports: [MatProgressSpinnerModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  // @Input() videoUrl: string = '';
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly location = inject(Location);
  readonly shakaService = inject(ShakaPlayerService);
  videoUrl!: string;

  isLoading = false;
  errorMessage = '';
  controls: boolean = true; // Enables video controls
  controlsList: string = 'nodownload'; // Prevents download option

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.videoUrl = params['videoUrl'];
    });
  }

  async ngAfterViewInit() {
    try {
      if (!this.videoUrl) {
        throw new Error('No video URL provided');
      }

      this.isLoading = true;

      const videoElement = this.videoPlayer.nativeElement;
      // For Amplify hosted videos, we might not need Shaka Player
      // if they're standard MP4/WebM files
      if (this.isStreamingUrl(this.videoUrl)) {
        // Initialize Shaka Player only for streaming content
        await this.shakaService.initialize(this.videoPlayer.nativeElement);
        await this.shakaService.loadVideo(this.videoUrl);
        // Request fullscreen after video loads
        this.requestFullscreen();
        await videoElement.play();
      } else {
        // For regular videos, set src directly
        this.videoPlayer.nativeElement.src = this.videoUrl;
        // Request fullscreen after video loads
        this.requestFullscreen();
        await videoElement.play();
      }

      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Failed to load video';
      console.error('Error initializing video:', error);
    }
  }

  async requestFullscreen() {
    try {
      const videoElement = this.videoPlayer.nativeElement;
      if (videoElement.requestFullscreen) {
        await videoElement.requestFullscreen();
      } else if ((videoElement as any).webkitRequestFullscreen) {
        await (videoElement as any).webkitRequestFullscreen();
      } else if ((videoElement as any).msRequestFullscreen) {
        await (videoElement as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  }

  private isStreamingUrl(url: string): boolean {
    // Check if the URL is for a streaming manifest
    return url.endsWith('.mpd') || url.endsWith('.m3u8');
  }

  onLoadStart() {
    this.isLoading = true;
    this.errorMessage = '';
  }

  onVideoLoaded() {
    this.isLoading = false;
    // const video = this.videoPlayer.nativeElement;
    // if (video.requestFullscreen) {
    //   video.requestFullscreen();
    // }
    // video.play();
  }

  onError(event: any) {
    this.isLoading = false;
    this.errorMessage = 'Error loading video. Please try again.';
    console.error('Video error:', event);
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    this.shakaService.destroy();
  }
}
