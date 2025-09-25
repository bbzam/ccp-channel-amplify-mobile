import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { loaderResolver } from './shared/component/loader/loader.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
  {
    path: 'landing-page',
    resolve: { loading: loaderResolver },
    data: { loadingMessage: 'Loading Page...' },
    loadComponent: () =>
      import('./features/public-view/public-view/public-view.component').then(
        (m) => m.PublicViewComponent
      ),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/public-view/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'about',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import('./features/public-view/about/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'privacy-policy',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/public-view/privacy-policy/privacy-policy.component'
          ).then((m) => m.PrivacyPolicyComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'callback',
    resolve: { loading: loaderResolver },
    data: { loadingMessage: 'Loading Page...' },
    children: [
      {
        path: 'message',
        loadComponent: () =>
          import(
            './features/public-view/payment-callback/message/message.component'
          ).then((m) => m.MessageComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'user',
    canActivate: [roleGuard, authGuard],
    resolve: { loading: loaderResolver },
    data: { roles: ['USER'], loadingMessage: 'Loading Page...' },
    loadComponent: () =>
      import('./features/user/user/user.component').then(
        (m) => m.UserComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/user/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'about',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import('./features/public-view/about/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'privacy-policy',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/public-view/privacy-policy/privacy-policy.component'
          ).then((m) => m.PrivacyPolicyComponent),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            './shared/component/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'subscriber',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['SUBSCRIBER', 'FREE_SUBSCRIBER'] },
    loadComponent: () =>
      import('./features/subscriber/subscriber/subscriber.component').then(
        (m) => m.SubscriberComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/subscriber/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'paywall',
        loadComponent: () =>
          import('./features/user/home-page/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'theater',
        loadComponent: () =>
          import('./features/subscriber/theater/theater.component').then(
            (m) => m.TheaterComponent
          ),
      },
      {
        path: 'film',
        loadComponent: () =>
          import('./features/subscriber/film/film.component').then(
            (m) => m.FilmComponent
          ),
      },
      {
        path: 'music',
        loadComponent: () =>
          import('./features/subscriber/music/music.component').then(
            (m) => m.MusicComponent
          ),
      },
      {
        path: 'dance',
        loadComponent: () =>
          import('./features/subscriber/dance/dance.component').then(
            (m) => m.DanceComponent
          ),
      },
      {
        path: 'education',
        loadComponent: () =>
          import('./features/subscriber/education/education.component').then(
            (m) => m.EducationComponent
          ),
      },
      {
        path: 'ccpspecial',
        loadComponent: () =>
          import('./features/subscriber/ccpspecial/ccpspecial.component').then(
            (m) => m.CcpspecialComponent
          ),
      },
      {
        path: 'ccpclassic',
        loadComponent: () =>
          import('./features/subscriber/ccpclassic/ccpclassic.component').then(
            (m) => m.CcpclassicComponent
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/subscriber/favorites/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
      },
      {
        path: 'video-player',
        loadComponent: () =>
          import('./shared/component/video-player/video-player.component').then(
            (m) => m.VideoPlayerComponent
          ),
      },
      {
        path: 'about',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import('./features/public-view/about/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'privacy-policy',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/public-view/privacy-policy/privacy-policy.component'
          ).then((m) => m.PrivacyPolicyComponent),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            './shared/component/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'content-curator',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['CONTENT_CREATOR'] },
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/dashboard/dashboard.component'
          ).then((m) => m.DashboardComponent),
      },
      {
        path: 'published',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-content/published/published.component'
          ).then((m) => m.PublishedComponent),
      },
      {
        path: 'scheduled',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-content/scheduled/scheduled.component'
          ).then((m) => m.ScheduledComponent),
      },
      {
        path: 'featured',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-featured-contents/setfeatured/setfeatured.component'
          ).then((m) => m.SetfeaturedComponent),
      },
      {
        path: 'settag',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-tag/settag/settag.component'
          ).then((m) => m.SettagComponent),
      },
      {
        path: 'tag',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-tag/tag/tag.component'
          ).then((m) => m.TagComponent),
      },
      {
        path: 'custom-fields',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-custom-fields/customfields/customfields.component'
          ).then((m) => m.CustomfieldsComponent),
      },
      {
        path: 'configure-landing-page',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-featured-contents/configure-landing-page/configure-landing-page.component'
          ).then((m) => m.ConfigureLandingPageComponent),
      },
      {
        path: 'manage-users',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/IT-admin/manage-user/manage-users/manage-users.component'
          ).then((m) => m.ManageUsersComponent),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            './shared/component/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'it-admin',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['IT_ADMIN'] },
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/IT-admin/dashboard/dashboard.component').then(
            (m) => m.ItAdminDashboardComponent
          ),
      },
      {
        path: 'manage-users',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/IT-admin/manage-user/manage-users/manage-users.component'
          ).then((m) => m.ManageUsersComponent),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            './shared/component/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
  {
    path: 'super-admin',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/dashboard/dashboard.component'
          ).then((m) => m.DashboardComponent),
      },
      {
        path: 'published',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-content/published/published.component'
          ).then((m) => m.PublishedComponent),
      },
      {
        path: 'scheduled',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-content/scheduled/scheduled.component'
          ).then((m) => m.ScheduledComponent),
      },
      {
        path: 'featured',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-featured-contents/setfeatured/setfeatured.component'
          ).then((m) => m.SetfeaturedComponent),
      },
      {
        path: 'settag',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-tag/settag/settag.component'
          ).then((m) => m.SettagComponent),
      },
      {
        path: 'tag',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-tag/tag/tag.component'
          ).then((m) => m.TagComponent),
      },
      {
        path: 'custom-fields',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-custom-fields/customfields/customfields.component'
          ).then((m) => m.CustomfieldsComponent),
      },
      {
        path: 'configure-landing-page',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/manage-featured-contents/configure-landing-page/configure-landing-page.component'
          ).then((m) => m.ConfigureLandingPageComponent),
      },
      {
        path: 'manage-users',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/IT-admin/manage-user/manage-users/manage-users.component'
          ).then((m) => m.ManageUsersComponent),
      },
      {
        path: 'account-settings',
        loadComponent: () =>
          import(
            './shared/component/account-settings/account-settings.component'
          ).then((m) => m.AccountSettingsComponent),
      },
      {
        path: 'notfound',
        loadComponent: () =>
          import('./shared/page-not-found/page-not-found.component').then(
            (m) => m.PageNotFoundComponent
          ),
      },
      { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
    ],
  },
];
