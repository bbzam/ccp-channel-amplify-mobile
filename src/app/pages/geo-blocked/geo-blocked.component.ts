import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-geo-blocked',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="blocked-container">
      <div class="blocked-content">
        <div class="logo">
          <img src="logo.png" alt="CCP Channel" />
        </div>
        
        <div class="flag">
          🇵🇭
        </div>
        
        <h1>Philippines Only</h1>
        
        <p class="message">
          CCP Channel Mobile is currently available exclusively in the Philippines.
        </p>
        
        <div class="info">
          <h3>Service Availability</h3>
          <p>Our streaming service is geo-restricted due to content licensing agreements.</p>
          <p>We're working to expand to more regions in the future.</p>
        </div>
        
        <div class="contact">
          <p>For inquiries, please contact our support team.</p>
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

    .flag {
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

    .info {
      background: rgba(102, 13, 33, 0.1);
      backdrop-filter: blur(15px);
      border-radius: 12px;
      border: 1px solid rgba(102, 13, 33, 0.2);
      padding: 20px;
      margin-bottom: 20px;
      text-align: left;
    }

    .info h3 {
      color: var(--tertiary);
      font-size: 18px;
      margin-bottom: 10px;
      text-align: center;
    }

    .info p {
      color: var(--tertiary);
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .contact {
      color: var(--gray);
      font-size: 14px;
    }

    @media (max-width: 480px) {
      .blocked-content {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .flag {
        font-size: 48px;
      }
    }
  `]
})
export class GeoBlockedComponent {}