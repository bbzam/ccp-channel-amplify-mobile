import { Injectable } from '@angular/core';
declare const shaka: any;

@Injectable({
  providedIn: 'root',
})
export class ShakaPlayerService {
  private player: any;
  private videoElement: HTMLVideoElement | null = null;

  async initialize(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      throw new Error('Browser not supported for video playback');
    }

    try {
      this.player = new shaka.Player(videoElement);

      // Add request filter for authentication
      this.player
        .getNetworkingEngine()
        .registerRequestFilter(async (type: any, request: any) => {
          try {
            // Get auth from session storage
            const token = sessionStorage.getItem('auth');

            // Add authorization header to all requests
            request.headers = {
              ...request.headers,
              Authorization: `Bearer ${token}`,
            };
          } catch (error) {}
        });

      this.player.configure({
        streaming: {
          bufferingGoal: 60,
          rebufferingGoal: 30,
          bufferBehind: 30,
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5,
          },
        },
        drm: {
          retryParameters: {
            maxAttempts: 5,
            baseDelay: 1000,
            backoffFactor: 2,
          },
        },
      });

      return this.player;
    } catch (error) {
      throw error;
    }
  }

  async loadVideo(url: string) {
    if (!this.player || !this.videoElement) {
      throw new Error('Player not initialized');
    }

    try {
      // Get signed URL if needed
      const secureUrl = await this.getSecureUrl(url);

      await this.player.load(secureUrl);

      if (this.videoElement.paused) {
        try {
          await this.videoElement.play();
        } catch (error) {
          this.videoElement.muted = true;
          await this.videoElement.play();
        }
      }
    } catch (error) {
      throw error;
    }
  }

  private async getSecureUrl(originalUrl: string): Promise<string> {
    try {
      // Get auth from session storage
      const token = sessionStorage.getItem('auth');

      // Add authentication token to URL
      const url = new URL(originalUrl);
      url.searchParams.append('token', String(token));

      return url.toString();
    } catch (error) {
      throw error;
    }
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    this.videoElement = null;
  }
}
