import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { DeviceGuard } from './auth/device.guard';
import { GeolocationGuard } from './auth/geolocation.guard';

export const routes: Routes = [
  {
    path: 'device-blocked',
    loadComponent: () =>
      import('./pages/device-blocked/device-blocked.component').then((m) => m.DeviceBlockedComponent),
  },
  {
    path: 'geo-blocked',
    loadComponent: () =>
      import('./pages/geo-blocked/geo-blocked.component').then((m) => m.GeoBlockedComponent),
  },
  { path: '', redirectTo: 'home', pathMatch: 'full', canActivate: [DeviceGuard, GeolocationGuard] },
  {
    path: 'home',
    canActivate: [DeviceGuard, GeolocationGuard],
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'about',
    canActivate: [DeviceGuard, GeolocationGuard],
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'privacy-policy',
    canActivate: [DeviceGuard, GeolocationGuard],
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
  },
  {
    path: 'user',
    canActivate: [DeviceGuard, GeolocationGuard, authGuard, roleGuard],
    data: { roles: ['USER'] },
    loadComponent: () =>
      import('./pages/user/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'subscriber',
    canActivate: [DeviceGuard, GeolocationGuard, authGuard, roleGuard],
    data: { roles: ['SUBSCRIBER', 'FREE_SUBSCRIBER'] },
    loadComponent: () =>
      import('./pages/subscriber/subscriber.component').then((m) => m.SubscriberComponent),
  },
  { path: '**', redirectTo: 'home' },
];