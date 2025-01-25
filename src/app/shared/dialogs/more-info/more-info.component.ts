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
