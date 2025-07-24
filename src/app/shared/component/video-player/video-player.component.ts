// import {
//   Component,
//   OnInit,
//   ViewChild,
//   ElementRef,
//   inject,
//   Input,
//   AfterViewInit,
// } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { Location } from '@angular/common';
// import { ShakaPlayerService } from '../../shaka-player.service';
// import { SharedService } from '../../shared.service';

// @Component({
//   selector: 'app-video-player',
//   imports: [MatProgressSpinnerModule],
//   templateUrl: './video-player.component.html',
//   styleUrl: './video-player.component.css',
// })
// export class VideoPlayerComponent implements OnInit, AfterViewInit {
//   @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
//   // @Input() videoUrl: string = '';
//   readonly router = inject(Router);
//   readonly route = inject(ActivatedRoute);
//   readonly location = inject(Location);
//   readonly shakaService = inject(ShakaPlayerService);
//   readonly sharedService = inject(SharedService);
//   videoUrl!: string;
//   contentId!: string;
//   pauseTime!: number;

//   isLoading = false;
//   errorMessage = '';
//   controls: boolean = true; // Enables video controls
//   controlsList: string = 'nodownload'; // Prevents download option

//   ngOnInit(): void {
//     this.route.queryParams.subscribe((params) => {
//       this.videoUrl = params['videoUrl'];
//       this.contentId = params['id'];
//     });
//   }

//   async ngAfterViewInit() {
//     try {
//       if (!this.videoUrl) {
//         throw new Error('No video URL provided');
//       }

//       this.isLoading = true;

//       const videoElement = this.videoPlayer.nativeElement;

//       // Add event listeners for tracking video playback
//       videoElement.addEventListener('pause', () => {
//         this.pauseTime = videoElement.currentTime;
//       });

//       videoElement.addEventListener('seeked', () => {
//       });

//       videoElement.addEventListener('play', () => {
//       });

//       // For Amplify hosted videos, we might not need Shaka Player
//       // if they're standard MP4/WebM files
//       if (this.isStreamingUrl(this.videoUrl)) {
//         // Initialize Shaka Player only for streaming content
//         await this.shakaService.initialize(this.videoPlayer.nativeElement);
//         await this.shakaService.loadVideo(this.videoUrl);
//         // Request fullscreen after video loads
//         this.requestFullscreen();
//         await videoElement.play();
//       } else {
//         // For regular videos, set src directly
//         this.videoPlayer.nativeElement.src = this.videoUrl;
//         // Request fullscreen after video loads
//         this.requestFullscreen();
//         await videoElement.play();
//       }

//       this.isLoading = false;
//     } catch (error) {
//       this.isLoading = false;
//       this.errorMessage = 'Failed to load video';
//     }
//   }

//   async requestFullscreen() {
//     try {
//       const videoElement = this.videoPlayer.nativeElement;
//       if (videoElement.requestFullscreen) {
//         await videoElement.requestFullscreen();
//       } else if ((videoElement as any).webkitRequestFullscreen) {
//         await (videoElement as any).webkitRequestFullscreen();
//       } else if ((videoElement as any).msRequestFullscreen) {
//         await (videoElement as any).msRequestFullscreen();
//       }
//     } catch (error) {
//     }
//   }

//   private isStreamingUrl(url: string): boolean {
//     // Check if the URL is for a streaming manifest
//     return url.endsWith('.mpd') || url.endsWith('.m3u8');
//   }

//   onLoadStart() {
//     this.isLoading = true;
//     this.errorMessage = '';
//   }

//   async onVideoLoaded() {
//     this.isLoading = false;
//     const video = this.videoPlayer.nativeElement;

//     // const userId = sessionStorage.getItem('userId');
//     const getContentToUserData = await this.sharedService.getContentToUser(
//       this.contentId
//     );
//     if (getContentToUserData) {
//       video.currentTime = Number(getContentToUserData.data[0].pauseTime);
//     }
//   }

//   onError(event: any) {
//     this.isLoading = false;
//     this.errorMessage = 'Error loading video. Please try again.';
//   }

//   goBack() {
//     this.location.back();
//   }

//   ngOnDestroy() {
//     this.shakaService.destroy();

//     // Get the current time right before saving
//     if (this.videoPlayer?.nativeElement) {
//       this.pauseTime = this.videoPlayer.nativeElement.currentTime;
//     }

//     this.sharedService.createContentToUser({
//       isFavorite: undefined,
//       contentId: this.contentId,
//       pauseTime: this.pauseTime,
//     });
//   }
// }

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
  Input,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location, isPlatformBrowser } from '@angular/common';
import { ShakaPlayerService } from '../../shaka-player.service';
import { SharedService } from '../../shared.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeaturesService } from '../../../features/features.service';

declare const shaka: any;

@Component({
  selector: 'app-video-player',
  imports: [MatProgressSpinnerModule, MatIconModule, MatButtonModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('thumbnailContainer')
  thumbnailContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('thumbnailImg') thumbnailImg!: ElementRef<HTMLImageElement>;
  @ViewChild('timeDisplay') timeDisplay!: ElementRef<HTMLDivElement>;

  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly location = inject(Location);
  readonly shakaService = inject(ShakaPlayerService);
  readonly sharedService = inject(SharedService);
  readonly featuresService = inject(FeaturesService);

  videoUrl!: string;
  thumbnailUrl!: string;
  vttUrl!: string;
  contentId!: string;
  pauseTime!: number;
  private player: any;
  private debounceTimer: any;

  isLoading = false;
  errorMessage = '';
  controls: boolean = true;
  controlsList: string = 'nodownload';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.videoUrl = params['videoUrl'];
      this.thumbnailUrl = params['thumbnailUrl'];
      this.vttUrl = params['vttUrl'];
      this.contentId = params['id'];

      console.log('videoUrl:', this.videoUrl);
      console.log('thumbnailUrl:', this.thumbnailUrl);

      // Set controls based on URL type BEFORE template renders
      this.controls = !this.isStreamingUrl(this.videoUrl);
    });
  }

  private async initShakaPlayer() {
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      throw new Error('Browser not supported!');
    }

    const video = this.videoPlayer.nativeElement;
    const container = this.videoContainer.nativeElement;

    this.player = new shaka.Player(video);

    // Register a request filter to modify segment requests
    this.player
      .getNetworkingEngine()
      .registerRequestFilter(async (type: any, request: any) => {
        // Only process segment requests (not manifest requests)
        if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
          try {
            // Extract the segment URL from the request
            const originalUrl = request.uris[0];

            // Check if this is an MP4 segment (for DASH) or TS segment (for HLS)
            if (
              originalUrl.endsWith('.mp4') ||
              originalUrl.includes('.mp4?') ||
              originalUrl.endsWith('.ts') ||
              originalUrl.includes('.ts?')
            ) {
              // Get the full path without query parameters
              const urlWithoutQuery = decodeURIComponent(
                originalUrl.split('?')[0]
              );

              console.log('urlWithoutQuery', urlWithoutQuery);

              // Get just the filename with extension
              const filename = urlWithoutQuery.substring(
                urlWithoutQuery.lastIndexOf('/') + 1
              );

              // Get the directory path
              const dirPath = urlWithoutQuery.substring(
                0,
                urlWithoutQuery.lastIndexOf('/') + 1
              );

              // Find the folder name (last part of the directory path)
              const folderName = dirPath.split('/').filter(Boolean).pop();

              // Construct the path for getFileUrl
              const filePath = `processed-full-videos/${folderName}/${filename}`;

              console.log('Getting presigned URL for:', filePath);

              // Get presigned URL for the segment
              const presignedUrl = await this.featuresService.getFileUrl(
                filePath
              );

              // Replace the original URL with the presigned URL
              request.uris[0] = presignedUrl;
            }
          } catch (error) {
            console.error('Error getting presigned URL:', error);
          }
        }
      });

    // Create UI factory
    const ui = new shaka.ui.Overlay(this.player, container, video);

    // Configure UI
    const uiConfig = {
      addSeekBar: true,
      controlPanelElements: [
        'play_pause',
        'time_and_duration',
        'spacer',
        'mute',
        'volume',
        'quality',
        'fullscreen',
      ],
      overflowMenuButtons: [
        'quality',
        'captions',
        'picture_in_picture',
        'cast',
      ],
      enableTooltips: true,
    };

    ui.configure(uiConfig);

    // Enable automatic adaptation between different quality levels
    this.player.configure({
      streaming: {
        rebufferingGoal: 2,
        bufferingGoal: 10,
        bufferBehind: 30,
      },
      abr: {
        enabled: true,
        defaultBandwidthEstimate: 1000000, // 1Mbps initial estimate
      },
    });
  }

  async ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (!this.videoUrl) {
        throw new Error('No video URL provided');
      }

      this.isLoading = true;
      const videoElement = this.videoPlayer.nativeElement;

      // Add event listeners
      videoElement.addEventListener('pause', () => {
        this.pauseTime = videoElement.currentTime;
      });

      if (this.isStreamingUrl(this.videoUrl)) {
        await this.initShakaPlayer();

        // For streaming files, get presigned URL for the manifest
        if (this.videoUrl.endsWith('.mpd') || this.videoUrl.endsWith('.m3u8')) {
          // Get the full path without query parameters
          const urlWithoutQuery = this.videoUrl.split('?')[0];

          // Get just the filename with extension
          const filename = urlWithoutQuery.substring(
            urlWithoutQuery.lastIndexOf('/') + 1
          );

          // Get the directory path
          const dirPath = urlWithoutQuery.substring(
            0,
            urlWithoutQuery.lastIndexOf('/') + 1
          );

          // Find the folder name (last part of the directory path)
          const folderName = dirPath.split('/').filter(Boolean).pop();

          // Construct the path for getFileUrl
          const filePath = `processed-full-videos/${folderName}/${filename}`;

          console.log('Getting presigned URL for manifest:', filePath);

          const presignedManifestUrl = await this.featuresService.getFileUrl(
            filePath
          );
          console.log('presignedManifestUrl', presignedManifestUrl);
          await this.player.load(presignedManifestUrl);
        } else {
          await this.player.load(this.videoUrl);
        }

        await this.setupThumbnails();
      } else {
        // For direct video files, get presigned URL
        const presignedUrl = await this.featuresService.getFileUrl(
          this.videoUrl
        );
        console.log('presignedUrl', presignedUrl);
        videoElement.src = presignedUrl;
      }

      await videoElement.play();
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error('Video player error:', error);
      this.errorMessage = 'Error loading video. Please try again.';
    }
  }

  private setupThumbnails() {
    setTimeout(() => {
      const seekBar =
        this.videoContainer.nativeElement.querySelector('.shaka-seek-bar');
      if (!seekBar) return;

      const baseUrl = this.thumbnailUrl.substring(
        0,
        this.thumbnailUrl.lastIndexOf('/') + 1
      );

      const vttBaseUrl = this.vttUrl.substring(
        0,
        this.vttUrl.lastIndexOf('/') + 1
      );

      fetch(this.thumbnailUrl)
        .then((response) => response.text())
        .then((vttContent) => {
          const cues = this.parseVTT(vttContent);

          seekBar.addEventListener('mousemove', (ev: Event) => {
            const event = ev as MouseEvent;
            const rect = seekBar.getBoundingClientRect();
            const position = (event.clientX - rect.left) / rect.width;
            const time = position * this.videoPlayer.nativeElement.duration;

            const left = Math.max(
              0,
              Math.min(event.clientX - rect.left - 80, rect.width - 160)
            );
            this.thumbnailContainer.nativeElement.style.left = `${left}px`;
            this.thumbnailContainer.nativeElement.style.bottom = '4em';
            this.thumbnailContainer.nativeElement.style.display = 'block';

            requestAnimationFrame(() => {
              this.thumbnailContainer.nativeElement.classList.add('visible');
            });

            this.timeDisplay.nativeElement.textContent = this.formatTime(time);

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
              const cue = this.findCueForTime(cues, time);
              console.log(baseUrl);
              console.log(cue.imageUrl);

              this.featuresService
                .getFileUrl(vttBaseUrl + decodeURIComponent(cue.imageUrl))
                .then((thumbnailImgPresignedUrl: string) => {
                  this.thumbnailImg.nativeElement.src =
                    thumbnailImgPresignedUrl;
                })
                .catch((error) => {
                  console.error('Failed to get presigned URL:', error);
                });
            }, 50);
          });

          seekBar.addEventListener('mouseleave', () => {
            this.thumbnailContainer.nativeElement.classList.remove('visible');
            this.thumbnailContainer.nativeElement.style.display = 'none';
          });
        });
    }, 1000);
  }

  private parseVTT(vttText: string) {
    const cues: any[] = [];
    const cueBlocks = vttText.split('\n\n');

    for (let i = 1; i < cueBlocks.length; i++) {
      const block = cueBlocks[i].trim();
      if (!block) continue;

      const lines = block.split('\n');
      if (lines.length < 2) continue;

      const timestamps = lines[0].split(' --> ');
      if (timestamps.length !== 2) continue;

      const startTime = this.parseTimestamp(timestamps[0]);
      const endTime = this.parseTimestamp(timestamps[1]);

      const imageLine = lines[1];
      const hashIndex = imageLine.indexOf('#');
      if (hashIndex === -1) continue;

      const imageUrl = imageLine.substring(0, hashIndex);
      const xywh = imageLine.substring(hashIndex + 6);
      const [x, y, width, height] = xywh.split(',').map(Number);

      cues.push({ startTime, endTime, imageUrl, x, y, width, height });
    }

    return cues;
  }

  private parseTimestamp(timestamp: string): number {
    const parts = timestamp.split(':');
    let hours = 0,
      minutes = 0,
      seconds = 0;

    if (parts.length === 3) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseFloat(parts[2]);
    } else if (parts.length === 2) {
      minutes = parseInt(parts[0], 10);
      seconds = parseFloat(parts[1]);
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  private findCueForTime(cues: any[], time: number) {
    return (
      cues.find((cue) => time >= cue.startTime && time < cue.endTime) || null
    );
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  }

  private isStreamingUrl(url: string): boolean {
    // Extract the path part of the URL (before query parameters)
    const urlPath = url.split('?')[0];
    // Check if the path ends with streaming extensions
    return urlPath.endsWith('.mpd') || urlPath.endsWith('.m3u8');
  }

  async requestFullscreen() {
    try {
      const videoElement = this.videoPlayer.nativeElement;
      if (videoElement.requestFullscreen) {
        await videoElement.requestFullscreen();
      }
    } catch (error) {}
  }

  onLoadStart() {
    this.isLoading = true;
    this.errorMessage = '';
  }

  async onVideoLoaded() {
    this.isLoading = false;
    const video = this.videoPlayer.nativeElement;
    const getContentToUserData = await this.sharedService.getContentToUser(
      this.contentId
    );
    if (getContentToUserData) {
      video.currentTime = Number(getContentToUserData.data[0].pauseTime);
    }
  }

  onError(event: any) {
    this.isLoading = false;
    this.errorMessage = 'Error loading video. Please try again.';
  }

  goBack() {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.destroy();
    }
    if (this.videoPlayer?.nativeElement) {
      this.pauseTime = this.videoPlayer.nativeElement.currentTime;
    }
    this.sharedService.createContentToUser({
      isFavorite: undefined,
      contentId: this.contentId,
      pauseTime: this.pauseTime,
    });
  }
}
