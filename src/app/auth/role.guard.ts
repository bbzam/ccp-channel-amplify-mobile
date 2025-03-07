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
          authService.logout();
          dialog
            .open(ErrorMessageDialogComponent, {
              data: {
                message:
                  'Unauthorized Access. You don’t have permission to access this page.',
              },
              disableClose: true,
            })
            .afterClosed();
        }
      }, 1000); // Check every second
    }
  }

  // Check if user has valid role and is authenticated
  if (!userRole || !requiredRoles.includes(userRole)) {
    authService.logout();
    dialog
      .open(ErrorMessageDialogComponent, {
        data: { message: 'You must be logged in to access this page.' },
        disableClose: true,
      })
      .afterClosed();
    return false;
  }

  // For SUBSCRIBER, restrict to only subscriber routes
  if (userRole === 'SUBSCRIBER' && !state.url.startsWith('/subscriber')) {
    router.navigate(['/subscriber']);
    return false;
  }

  // For CONTENT_CREATOR, restrict to only content-curator routes
  if (
    userRole === 'CONTENT_CREATOR' &&
    !state.url.startsWith('/content-curator')
  ) {
    router.navigate(['/content-curator']);
    return false;
  }

  // For IT_ADMIN, restrict to only it-admin routes
  if (userRole === 'IT_ADMIN' && !state.url.startsWith('/it-admin')) {
    router.navigate(['/it-admin']);
    return false;
  }

  // For SUPER_ADMIN, restrict to only super-admin routes
  if (userRole === 'SUPER_ADMIN' && !state.url.startsWith('/super-admin')) {
    router.navigate(['/super-admin']);
    return false;
  }

  return true;
};
