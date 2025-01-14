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
import { CoreServiceService } from '../core-service.service';

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
  readonly coreService = inject(CoreServiceService);

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
    if (
      sessionStorage.getItem('isLoggedIn') == 'false' ||
      sessionStorage.getItem('isLoggedIn') == null
    ) {
      return false;
    } else {
      return true;
    }
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
}
