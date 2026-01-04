import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Array<string>;
  const userRole = sessionStorage.getItem('role');

  // Check if user has valid role
  if (!userRole || !requiredRoles.includes(userRole)) {
    alert('You don\'t have permission to access this page.');
    authService.logout();
    return false;
  }

  // Route users to their appropriate sections
  if (userRole === 'USER' && !state.url.startsWith('/user')) {
    router.navigate(['/user']);
    return false;
  }

  if ((userRole === 'SUBSCRIBER' || userRole === 'FREE_SUBSCRIBER') && 
      !state.url.startsWith('/subscriber')) {
    router.navigate(['/subscriber']);
    return false;
  }

  return true;
};