import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MoreInfoComponent } from '../../dialogs/more-info/more-info.component';
import { MatDividerModule } from '@angular/material/divider';
import { FeaturesService } from '../../../features/features.service';

@Component({
  selector: 'app-list-grid',
  imports: [MatCardModule, MatIcon, MatDividerModule],
  templateUrl: './list-grid.component.html',
  styleUrl: './list-grid.component.css',
})
export class ListGridComponent implements AfterViewInit, OnInit {
  @ViewChildren('video') videos!: QueryList<ElementRef>;
  @Input() items: any[] = [];
  @Input() title!: string;

  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    // No pagination logic needed
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
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
      observer.observe(videoRef.nativeElement);
    });
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

  watchVideo(videoUrl: string) {
    this.featuresService.getFileUrl(videoUrl).then((presignedUrl) => {
      this.router.navigate(['subscriber/video-player'], {
        queryParams: { videoUrl: presignedUrl },
      });
    });
  }

  moreInfo(item: any) {
    this.dialog
      .open(MoreInfoComponent, { data: { data: item } })
      .afterClosed()
      .subscribe((data) => {});
  }
}
