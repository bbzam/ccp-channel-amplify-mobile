import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().then((isAuthenticated) => {
    if (isAuthenticated) {
      return true;
    } else {
      alert('You must be logged in to access this page.');
      router.navigate(['/landing-page']);
      return false;
    }
  });
};