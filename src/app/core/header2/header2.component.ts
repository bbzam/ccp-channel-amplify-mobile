import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmationDialogComponent } from '../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { AuthServiceService } from '../../auth/auth-service.service';

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

  menu() {
    this.menuClicked.emit();
  }

  get username(): string {
    // return String(sessionStorage.getItem('username'));
    return 'Jhomark Alber';
  }

  get email(): string {
    // return String(sessionStorage.getItem('email'));
    return 'jhomark@sitesphil.com';
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
}
