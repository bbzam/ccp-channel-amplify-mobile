import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationDialogComponent } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { AuthServiceService } from '../../auth/auth-service.service';
import { FeaturesService } from '../../features/features.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header2',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './header2.component.html',
  styleUrl: './header2.component.css',
})
export class Header2Component {
  @Output() menuClicked = new EventEmitter<void>();
  readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthServiceService);
  readonly featuresService = inject(FeaturesService);
  readonly router = inject(Router);

  menu() {
    this.menuClicked.emit();
  }

  get username(): string {
    return String(sessionStorage.getItem('username'));
  }

  get email(): string {
    return String(sessionStorage.getItem('email'));
  }

  get role(): string {
    return String(sessionStorage.getItem('role'));
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

  settingOnClick() {
    switch (this.role) {
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
}
