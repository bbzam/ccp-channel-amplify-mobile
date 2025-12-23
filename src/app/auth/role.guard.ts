import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from './auth-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorMessageDialogComponent } from '../shared/dialogs/error-message-dialog/error-message-dialog.component';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthServiceService);
  const router = inject(Router);
  const dialog = inject(MatDialog);
  const requiredRoles = route.data['roles'] as Array<string>;
  const userRole = sessionStorage.getItem('role');
  let initialRole: string | null = null;
  let roleCheckInterval: any = null;

  // Set initial role if it hasn't been set yet and start monitoring
  if (initialRole === null) {
    initialRole = userRole;

    // Start monitoring role changes
    if (!roleCheckInterval) {
      roleCheckInterval = setInterval(() => {
        const currentRole = sessionStorage.getItem('role');
        const auth = sessionStorage.getItem('auth');
        if (currentRole !== initialRole && auth) {
          // Clear the interval
          clearInterval(roleCheckInterval);
          roleCheckInterval = null;

          // Logout and show error message
          dialog
            .open(ErrorMessageDialogComponent, {
              data: {
                message:
                  'Unauthorized Access. You don’t have permission to access this page.',
              },
              disableClose: true,
            })
            .afterClosed()
            .subscribe(() => {
              authService.logout();
            });
        }
      }, 1000); // Check every second
    }
  }

  // Check if user has valid role and is authenticated
  if (!userRole || !requiredRoles.includes(userRole)) {
    dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: 'You must be logged in to access this page.' },
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() => {
        authService.logout();
      });
    return false;
  }

  // For USER, restrict to only user routes
  if (userRole === 'USER' && !state.url.startsWith('/user')) {
    router.navigate(['/user']);
    return false;
  }

  // For SUBSCRIBER, restrict to only subscriber routes
  if (
    (userRole === 'SUBSCRIBER' || userRole === 'FREE_SUBSCRIBER') &&
    !state.url.startsWith('/subscriber')
  ) {
    router.navigate(['/subscriber']);
    return false;
  }
  return true;
};
