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
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { SignupComponent } from '../../../auth/components/signup/signup.component';
import { FeaturesService } from '../../features.service';

@Component({
  selector: 'app-banner',
  imports: [MatButtonModule, MatIconModule, NgClass],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent implements OnInit, AfterViewInit {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @Input() banners!: any[];
  readonly dialog = inject(MatDialog);
  readonly featuresService = inject(FeaturesService);
  currentMediaIndex: number = 0;
  showPhoto: boolean = true;
  teaserDuration!: number;

  ngAfterViewInit(): void {
    this.autoPlayMedia();
  }

  ngOnInit(): void {}

  get role(): string {
    return String(sessionStorage.getItem('role'));
  }

  get username(): string {
    return String(sessionStorage.getItem('username'));
  }

  async subscribeNowOnClick(rate: string) {
    if (rate && this.role === 'USER') {
      const url = await this.featuresService.createPayment(rate);

      if (url) {
        console.log('result', url);
        window.location.href = url;
      }
    } else {
      return;
    }
  }

  autoPlayMedia() {
    const updateMedia = () => {
      this.getVideoDuration();
      const currentMedia = this.banners[this.currentMediaIndex];

      if (this.showPhoto) {
        this.showPhoto = false;
      } else {
        this.showPhoto = true;
        this.currentMediaIndex =
          (this.currentMediaIndex + 1) % this.banners.length;
      }
      // Dynamically adjust the timeout based on the updated `showPhoto` value
      setTimeout(updateMedia, this.showPhoto ? 5000 : this.teaserDuration);
    };
    // Start the first timeout
    this.getVideoDuration();
    setTimeout(updateMedia, this.showPhoto ? 5000 : this.teaserDuration);
  }

  getVideoDuration(): number {
    const videoElement = document.createElement('video');

    // Add URL validation here
    const videoUrl = this.banners[this.currentMediaIndex].teaser;
    if (videoUrl && videoUrl !== 'undefined' && videoUrl.trim() !== '') {
      videoElement.src = videoUrl;

      videoElement.addEventListener('loadedmetadata', () => {
        this.teaserDuration = videoElement.duration * 1000;
      });
    } else {
      this.teaserDuration = 5000; // Default duration
    }

    return this.teaserDuration;
  }

  register(): void {
    this.dialog.open(SignupComponent, { disableClose: true }).afterClosed();
  }
}
