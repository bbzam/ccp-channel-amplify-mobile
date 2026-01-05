import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="loader-overlay">
        <div class="loader">
          <img src="logo.png" alt="ccp-logo" />
        </div>
        @if (message) {
          <div>
            <p class="message">{{ message }}</p>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      flex-direction: column;
    }

    .loader {
      position: relative;
      width: 4em;
      height: 4em;
      border: 5px solid #f3f3f3;
      border-radius: 50%;
      border-top: 5px solid #660d21;
      animation: spin 1s linear infinite;
    }

    .loader img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 3em;
      height: 3em;
      animation: anti-spin 1s linear infinite;
    }

    .message {
      color: white;
      margin: 0.5em 0;
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes anti-spin {
      0% { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(-360deg); }
    }
  `]
})
export class LoaderComponent {
  @Input() isLoading = false;
  @Input() message = '';
}