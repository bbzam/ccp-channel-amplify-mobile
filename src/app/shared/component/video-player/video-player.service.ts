import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoPlayerService {
  private videoData = new BehaviorSubject<any>(null);

  setVideoData(data: any) {
    this.videoData.next(data);
  }

  getVideoData() {
    return this.videoData.value;
  }

  clearVideoData() {
    this.videoData.next(null);
  }
}
