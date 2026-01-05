import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-blocked',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blocked-container">
      <div class="blocked-content">
        <div class="logo">
          <img src="logo.png" alt="CCP Channel" />
        </div>
        
        <div class="icon">
          📱
        </div>
        
        <h1>Mobile App Only</h1>
        
        <p class="message">
          CCP Channel Mobile is designed exclusively for mobile devices.
        </p>
        
        <div class="instructions">
          <h3>To access CCP Channel:</h3>
          <ul>
            <li>📱 Open this link on your mobile device</li>
            <li>💻 Visit our web app for desktop experience</li>
            <li>📲 Download our mobile app from app stores</li>
          </ul>
        </div>
        
        <div class="links">
          <button class="btn-primary">Go to Web App</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .blocked-container {
      min-height: 100vh;
      background: var(--body-linear-gradient);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      font-family: 'Montserrat', sans-serif;
    }

    .blocked-content {
      background: var(--secondary);
      border-radius: 16px;
      padding: 40px 30px;
      text-align: center;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(102, 13, 33, 0.3);
      border: 1px solid rgba(102, 13, 33, 0.2);
    }

    .logo img {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
    }

    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    h1 {
      color: var(--tertiary);
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
    }

    .message {
      color: var(--gray);
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    }

    .instructions {
      text-align: left;
      margin-bottom: 30px;
      background: rgba(102, 13, 33, 0.1);
      backdrop-filter: blur(15px);
      border-radius: 12px;
      border: 1px solid rgba(102, 13, 33, 0.2);
      padding: 20px;
    }

    .instructions h3 {
      color: var(--tertiary);
      font-size: 18px;
      margin-bottom: 15px;
      text-align: center;
    }

    .instructions ul {
      list-style: none;
      padding: 0;
    }

    .instructions li {
      padding: 8px 0;
      color: var(--tertiary);
      font-size: 14px;
    }

    .links {
      margin-top: 20px;
    }

    .btn-primary {
      background-color: var(--primary);
      color: var(--tertiary);
      border: none;
      border-radius: 0.5em;
      padding: 0.75em 1.5em;
      font-size: 0.875em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 2.5em;
      width: 100%;
      margin: 0.5em 0;
    }

    .btn-primary:hover {
      background-color: var(--primary-hovered);
      transform: translateY(-1px);
    }

    @media (max-width: 480px) {
      .blocked-content {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .icon {
        font-size: 48px;
      }
    }
  `]
})
export class DeviceBlockedComponent {}