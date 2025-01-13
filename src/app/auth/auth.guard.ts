import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  // Return the Promise directly from isAuthenticated()
  return authService.isAuthenticated().then((isAuthenticated) => {
    if (isAuthenticated) {
      return true; // Allow access to the route
    } else {
      dialog
        .open(ErrorMessageDialogComponent, {
          data: { message: 'You must be logged in to access this page.' },
        })
        .afterClosed()
        .subscribe((data) => {
          router.navigate(['/landing-page']); // Redirect to landing page if not authenticated
        });
      return false; // Deny access
    }
  });
};
