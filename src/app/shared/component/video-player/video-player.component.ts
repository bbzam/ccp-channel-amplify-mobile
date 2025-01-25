import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-video-player',
  imports: [MatProgressSpinnerModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  videoUrl!: string;

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.videoUrl = params['videoUrl'];
    });
  }

  onLoadStart() {
    this.isLoading = true;
    this.errorMessage = '';
  }

  onVideoLoaded() {
    this.isLoading = false;
    const video = this.videoPlayer.nativeElement;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
    video.play();
  }

  onError(event: any) {
    this.isLoading = false;
    this.errorMessage = 'Error loading video. Please try again.';
    console.error('Video error:', event);
  }

  goBack() {
    this.router.navigate(['/subscriber']); // or wherever you want to return to
  }
}
