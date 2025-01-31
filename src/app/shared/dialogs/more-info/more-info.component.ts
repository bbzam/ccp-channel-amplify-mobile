import { Component, Inject, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-more-info',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './more-info.component.html',
  styleUrl: './more-info.component.css',
})
export class MoreInfoComponent {
  @Input() item: any;
  readonly dialogRef = inject(MatDialogRef<MoreInfoComponent>);
  readonly router = inject(Router);

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.item = data.data;
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
    this.dialogRef.close();
    this.router.navigate(['subscriber/video-player'], {
      queryParams: { videoUrl },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
