import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import {
  AmplifyAuthenticatorModule,
  AuthenticatorService,
} from '@aws-amplify/ui-angular';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { Capacitor } from '@capacitor/core';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { LoadingService } from './shared/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [
    AmplifyAuthenticatorModule,
    RouterOutlet,
    LoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'CCP Channel Mobile';
  readonly authenticator = inject(AuthenticatorService);
  readonly renderer = inject(Renderer2);
  readonly elementRef = inject(ElementRef);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly loadingService = inject(LoadingService);

  // Platform detection
  isNative = Capacitor.isNativePlatform();
  platform = Capacitor.getPlatform();

  // Disable right-click for web version
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    if (!this.isNative) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isNative) {
      if (
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && event.key === 'I')
      ) {
        event.preventDefault();
      }
    }
  }

  ngOnInit(): void {
    this.handleRoleBasedRedirection();
    this.setupPlatformSpecificFeatures();
    this.hideInitialLoader();
  }

  constructor() {
    Amplify.configure(outputs);
  }

  get userRole(): string {
    return String(sessionStorage.getItem('role'));
  }

  private setupPlatformSpecificFeatures() {
    if (this.isNative) {
      // Mobile-specific setup
      this.setupMobileFeatures();
    } else {
      // Web-specific setup
      this.setupWebFeatures();
    }

    // TV-specific setup
    if (this.platform === 'android' && this.isTVDevice()) {
      this.setupTVFeatures();
    }
  }

  private setupMobileFeatures() {
    // Add mobile-specific classes
    document.body.classList.add('mobile-platform');
    
    // Handle mobile-specific behaviors
    this.preventZoom();
  }

  private setupWebFeatures() {
    document.body.classList.add('web-platform');
  }

  private setupTVFeatures() {
    document.body.classList.add('tv-platform');
    
    // Enable focus navigation for TV
    this.enableTVNavigation();
  }

  private isTVDevice(): boolean {
    // Detect if running on Android TV or Google TV
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('tv') || 
           userAgent.includes('googletv') || 
           window.innerWidth >= 1920;
  }

  private preventZoom() {
    // Prevent pinch-to-zoom on mobile
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  private enableTVNavigation() {
    // Add focus management for TV remote navigation
    document.addEventListener('keydown', (event) => {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.focusNext(focusableElements, currentIndex);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.focusPrevious(focusableElements, currentIndex);
          break;
      }
    });
  }

  private focusNext(elements: NodeListOf<Element>, currentIndex: number) {
    const nextIndex = (currentIndex + 1) % elements.length;
    (elements[nextIndex] as HTMLElement).focus();
  }

  private focusPrevious(elements: NodeListOf<Element>, currentIndex: number) {
    const prevIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
    (elements[prevIndex] as HTMLElement).focus();
  }

  private hideInitialLoader() {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => loader.remove(), 300);
    }
  }

  private handleRoleBasedRedirection() {
    const currentUrl = this.router.url;
    const publicRoutes = ['/about', '/landing-page'];

    switch (this.userRole) {
      case 'USER':
        if (publicRoutes.includes(currentUrl)) {
          this.router.navigate(['/user']);
        }
        break;
      case 'SUBSCRIBER':
      case 'FREE_SUBSCRIBER':
        if (publicRoutes.includes(currentUrl)) {
          this.router.navigate(['/subscriber']);
        }
        break;
      default:
        if (!publicRoutes.includes(currentUrl) && currentUrl !== '/callback/message') {
          this.router.navigate(['/landing-page']);
        }
    }
  }
}