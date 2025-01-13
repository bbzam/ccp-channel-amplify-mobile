import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { navItems } from '../navigation/navItems';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs';
import { AuthServiceService } from '../../auth/auth-service.service';

@Component({
  selector: 'app-sidenav',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    NgClass,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent implements OnInit {
  navItems: any[] = navItems;
  currentRoute!: string;
  readonly router = inject(Router);
  readonly activatedRoute = inject(ActivatedRoute);
  readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthServiceService)

  ngOnInit(): void {
    // Get the initial route and listen for route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  @ViewChild('drawer') drawer!: MatDrawer;
  @HostListener('window:resize') updatetoggleDrawer(): void {
    const width = window.innerWidth;
    if (width >= 1025) {
      this.closeToggleDrawer();
    }
  }

  get username(): string {
    return String(sessionStorage.getItem('username'));
  }

  get email(): string {
    return String(sessionStorage.getItem('email'));
  }

  toggleDrawer() {
    this.drawer.toggle(); // Toggle the drawer visibility
  }

  closeToggleDrawer() {
    this.drawer.close();
  }

  navigate(routeLink: string) {
    this.router.navigate([routeLink]);
  }

  logout() {
    this.drawer.close();
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
}
