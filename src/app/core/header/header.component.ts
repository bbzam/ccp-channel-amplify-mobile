import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SigninComponent } from '../../auth/components/signin/signin.component';
import { NavigationComponent } from '../navigation/navigation.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthServiceService } from '../../auth/auth-service.service';
import { FeaturesService } from '../../features/features.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    MatDialogModule,
    NavigationComponent,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isScrolled: boolean = false;
  currentRoute: string = '';
  path: string = '/landing-page';

  @Output() menuClicked = new EventEmitter<void>();
  readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly cdr = inject(ChangeDetectorRef);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly authService = inject(AuthServiceService);
  readonly featuresService = inject(FeaturesService);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  constructor() {}

  @HostListener('window:scroll') onWindowScroll(): void {
    this.isScrolled = window.scrollY > 0;
  }

  get isAuthenticated(): boolean {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const auth = sessionStorage.getItem('auth');
    if (!isLoggedIn || !auth) return false;

    return true;
  }

  get role(): string {
    return String(sessionStorage.getItem('role'));
  }

  get username(): string {
    return String(sessionStorage.getItem('username'));
  }

  get email(): string {
    return String(sessionStorage.getItem('email'));
  }

  signInOnClick() {
    this.dialog
      .open(SigninComponent)
      .afterClosed()
      .subscribe((data) => {});
  }

  logout() {
    this.dialog
      .open(ConfirmationDialogComponent, {
        data: { message: 'Are you sure you want to logout?' },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.authService.logout();
        }
      });
  }

  menu() {
    this.menuClicked.emit();
  }

  goToDashboard() {
    this.router.navigate(['/subscriber']);
  }

  settingOnClick() {
    switch (this.role) {
      case 'USER':
        this.router.navigate(['user/account-settings']);
        break;
      case 'SUBSCRIBER':
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
}
