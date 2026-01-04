import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  signal,
  ComponentRef,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { SigninComponent } from '../../auth/components/signin/signin.component';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isScrolled: boolean = false;
  currentRoute: string = '';
  path: string = '/landing-page';
  isSearchOpen: boolean = false;
  
  // Efficient auth state management
  readonly isAuthenticated = signal(false);
  readonly username = signal('');
  readonly email = signal('');
  readonly role = signal('');

  @Output() menuClicked = new EventEmitter<void>();
  readonly router = inject(Router);
  readonly cdr = inject(ChangeDetectorRef);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private signinDialogRef: ComponentRef<SigninComponent> | null = null;

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
    
    // Initialize auth state once
    this.updateAuthState();
    
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', () => this.updateAuthState());
  }
  
  private updateAuthState(): void {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const auth = sessionStorage.getItem('auth');
    
    this.isAuthenticated.set(isLoggedIn && !!auth);
    this.username.set(sessionStorage.getItem('username') || '');
    this.email.set(sessionStorage.getItem('email') || '');
    this.role.set(sessionStorage.getItem('role') || '');
  }

  constructor() {}

  @HostListener('window:scroll') onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  @HostListener('document:keydown.escape') onEscapeKey(): void {
    if (this.isSearchOpen) {
      this.closeSearch();
    }
  }

  openSearch(): void {
    this.isSearchOpen = true;
  }

  closeSearch(): void {
    this.isSearchOpen = false;
  }

  signInOnClick() {
    console.log('Sign in button clicked'); // Debug log
    try {
      this.openSigninDialog();
      console.log('Dialog opened'); // Debug log
    } catch (error) {
      console.error('Error opening dialog:', error);
      alert('Error opening sign-in dialog');
    }
  }

  private openSigninDialog() {
    if (this.signinDialogRef) {
      this.signinDialogRef.destroy();
    }

    this.signinDialogRef = createComponent(SigninComponent, {
      environmentInjector: this.injector
    });

    this.signinDialogRef.instance.isVisible = true;
    this.signinDialogRef.instance.closeDialog.subscribe(() => {
      this.closeSigninDialog();
    });

    this.appRef.attachView(this.signinDialogRef.hostView);
    document.body.appendChild(this.signinDialogRef.location.nativeElement);
  }

  private closeSigninDialog() {
    if (this.signinDialogRef) {
      this.appRef.detachView(this.signinDialogRef.hostView);
      this.signinDialogRef.destroy();
      this.signinDialogRef = null;
    }
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.updateAuthState(); // Update state after logout
    }
  }

  menu() {
    this.menuClicked.emit();
  }

  goToDashboard() {
    this.router.navigate(['/subscriber']);
  }

  settingOnClick() {
    switch (this.role()) {
      case 'USER':
        this.router.navigate(['user/account-settings']);
        break;
      case 'SUBSCRIBER':
        this.router.navigate(['subscriber/account-settings']);
        break;
      case 'FREE_SUBSCRIBER':
        this.router.navigate(['subscriber/account-settings']);
        break;
      case 'CONTENT_CREATOR':
        this.router.navigate(['content-curator/account-settings']);
        break;
      case 'IT_ADMIN':
        this.router.navigate(['it-admin/account-settings']);
        break;
      case 'SUPER_ADMIN':
        this.router.navigate(['super-admin/account-settings']);
        break;
    }
  }

  favoritesOnClick() {
    this.router.navigate(['subscriber/favorites']);
  }

  scrollToTop() {
    window.scrollTo(0, 0);
  }
}
