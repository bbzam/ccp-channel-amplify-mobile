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
import { allFeatured } from '../../../shared/mock-data';
import { MoreInfoComponent } from '../../../shared/dialogs/more-info/more-info.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { BetaAccessComponent } from '../../../beta-test/beta-access/beta-access.component';
import { SignupComponent } from '../../../auth/components/signup/signup.component';

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
  currentMediaIndex: number = 0;
  showPhoto: boolean = true;
  teaserDuration!: number;

  ngAfterViewInit(): void {
    this.autoPlayMedia();
  }

  ngOnInit(): void {}

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
    videoElement.src = this.banners[this.currentMediaIndex].teaser;

    // Listen for the loadedmetadata event to ensure duration is available
    if (this.banners[this.currentMediaIndex].teaser) {
      videoElement.addEventListener('loadedmetadata', () => {
        this.teaserDuration = videoElement.duration * 1000; // Duration in milliseconds
      });
    } else {
      this.teaserDuration = 0;
    }

    return this.teaserDuration;
  }

  register(): void {
    // this.dialog.open(SignupComponent).afterClosed().subscribe();
    this.dialog
      .open(BetaAccessComponent)
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.dialog.open(SignupComponent).afterClosed();
        }
      });
  }
}
