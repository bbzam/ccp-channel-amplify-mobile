import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class DeviceGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    // Allow if running as native app
    if (Capacitor.isNativePlatform()) {
      return true;
    }

    // Check if it's a mobile browser
    if (this.isMobileDevice()) {
      return true;
    }

    // Block desktop browsers
    this.router.navigate(['/device-blocked']);
    return false;
  }

  private isMobileDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'windows phone', 'mobile', 'tablet'
    ];
    
    // Check screen size (mobile/tablet typically < 1024px width)
    const isMobileScreen = window.innerWidth <= 1024;
    
    // Check user agent for mobile keywords
    const isMobileUserAgent = mobileKeywords.some(keyword => 
      userAgent.includes(keyword)
    );

    return isMobileScreen || isMobileUserAgent;
  }
}