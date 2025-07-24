import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  inject,
  Input,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FeaturesService } from '../../../features/features.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass } from '@angular/common';
import { SharedService } from '../../shared.service';
import { VideoPlayerService } from '../../component/video-player/video-player.service';

@Component({
  selector: 'app-more-info',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, NgClass],
  templateUrl: './more-info.component.html',
  styleUrl: './more-info.component.css',
})
export class MoreInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('video') videos!: QueryList<ElementRef>;
  @Input() item: any;
  readonly dialogRef = inject(MatDialogRef<MoreInfoComponent>);
  readonly router = inject(Router);
  readonly featuresService = inject(FeaturesService);
  readonly sharedService = inject(SharedService);
  readonly videoPlayerService = inject(VideoPlayerService);
  private observer: IntersectionObserver | null = null;
  isFavorite: boolean = false;
  customFieldsMap: Map<string, string> = new Map();
  parsedCustomFields: any[] = [];

  // Disable right-click for more info dialog
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    return false;
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
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
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.item = data.data;
    this.isFavorite = this.item.isFavorite;
    this.initializeCustomFields();
  }

  async initializeCustomFields() {
    await this.loadCustomFields();
    this.parseCustomFields();
  }

  async loadCustomFields() {
    try {
      const customFields = await this.sharedService.getAllCustomFields();
      customFields?.forEach((field: any) => {
        this.customFieldsMap.set(field.id, field.fieldName);
      });
    } catch (error) {}
  }

  parseCustomFields() {
    try {
      if (this.item.customFields) {
        const parsed =
          typeof this.item.customFields === 'string'
            ? JSON.parse(this.item.customFields)
            : this.item.customFields;

        this.parsedCustomFields = Array.from(this.customFieldsMap.keys())
          .filter((fieldId) => parsed[fieldId])
          .map((fieldId) => ({
            name: this.customFieldsMap.get(fieldId) || fieldId,
            value: parsed[fieldId],
          }))
          .filter((field) => field.value);
      }
    } catch (error) {
      this.parsedCustomFields = [];
    }
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

  watchVideo(videoUrl: string, thumbnailUrl: string, id: string) {
    this.close();

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

  async toggleFavorite() {
    this.item.isFavorite = !this.item.isFavorite;
    try {
      await this.featuresService.toggleFavorite(
        this.item.id,
        this.item.isFavorite
      );
    } catch (error) {}
  }

  close() {
    this.dialogRef.close();
  }
}
