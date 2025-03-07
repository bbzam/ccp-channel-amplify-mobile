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
    data: { roles: ['SUBSCRIBER', 'USER'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/subscriber/home/home.component').then(
            (m) => m.HomeComponent
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
            './features/content-curator/published/published.component'
          ).then((m) => m.PublishedComponent),
      },
      {
        path: 'scheduled',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/scheduled/scheduled.component'
          ).then((m) => m.ScheduledComponent),
      },
      {
        path: 'featured',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/content-curator/setfeatured/setfeatured.component'
          ).then((m) => m.SetfeaturedComponent),
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
        path: 'add-user',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './features/IT-admin/manage-user/add-user/add-user.component'
          ).then((m) => m.AddUserComponent),
      },
      {
        path: 'manage-keys',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
        loadComponent: () =>
          import(
            './beta-test/manage-keys/manage-keys.component'
          ).then((m) => m.ManageKeysComponent),
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
      },
      {
        path: 'add-user',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
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
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/super-admin/dashboard/dashboard.component').then(
            (m) => m.SuperAdminDashboardComponent
          ),
      },
      {
        path: 'published',
        loadComponent: () =>
          import(
            './features/content-curator/published/published.component'
          ).then((m) => m.PublishedComponent),
      },
      {
        path: 'scheduled',
        loadComponent: () =>
          import(
            './features/content-curator/scheduled/scheduled.component'
          ).then((m) => m.ScheduledComponent),
      },
      {
        path: 'manage-users',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
      },
      {
        path: 'add-user',
        resolve: { loading: loaderResolver },
        data: { loadingMessage: 'Loading Page...' },
      },
      // {
      //   path: 'upload-content',
      //   resolve: { loading: loaderResolver },
      //   data: { loadingMessage: 'Loading Page...' },
      //   loadComponent: () =>
      //     import(
      //       './features/content-curator/upload-content/upload-content.component'
      //     ).then((m) => m.UploadContentComponent),
      // },
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

// import { Routes } from '@angular/router';
// import { TheaterComponent } from './features/subscriber/theater/theater.component';
// import { FilmComponent } from './features/subscriber/film/film.component';
// import { MusicComponent } from './features/subscriber/music/music.component';
// import { DanceComponent } from './features/subscriber/dance/dance.component';
// import { EducationComponent } from './features/subscriber/education/education.component';
// import { CcpspecialComponent } from './features/subscriber/ccpspecial/ccpspecial.component';
// import { CcpclassicComponent } from './features/subscriber/ccpclassic/ccpclassic.component';
// import { authGuard } from './auth/auth.guard';
// import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
// import { DashboardComponent } from './features/content-curator/dashboard/dashboard.component';
// import { PublishedComponent } from './features/content-curator/published/published.component';
// import { ScheduledComponent } from './features/content-curator/scheduled/scheduled.component';
// import { PublicViewComponent } from './features/public-view/public-view/public-view.component';
// import { HomeComponent } from './features/subscriber/home/home.component';
// import { roleGuard } from './auth/role.guard';
// import { ItAdminDashboardComponent } from './features/IT-admin/dashboard/dashboard.component';
// import { SuperAdminDashboardComponent } from './features/super-admin/dashboard/dashboard.component';
// import { VideoPlayerComponent } from './shared/component/video-player/video-player.component';

// export const routes: Routes = [
//   {
//     path: '',
//     children: [
//       { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
//       { path: 'landing-page', component: PublicViewComponent },
//     ],
//   },
//   {
//     path: 'subscriber',
//     canActivate: [roleGuard, authGuard],
//     data: { roles: ['SUBSCRIBER', 'USER'] },
//     children: [
//       { path: '', component: HomeComponent },
//       { path: 'theater', component: TheaterComponent },
//       { path: 'film', component: FilmComponent },
//       { path: 'music', component: MusicComponent },
//       { path: 'dance', component: DanceComponent },
//       { path: 'education', component: EducationComponent },
//       { path: 'ccpspecial', component: CcpspecialComponent },
//       { path: 'ccpclassic', component: CcpclassicComponent },
//       { path: 'video-player', component: VideoPlayerComponent },
//     ],
//   },
//   {
//     path: 'content-curator',
//     canActivate: [roleGuard, authGuard],
//     data: { roles: ['CONTENT_CREATOR'] },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: DashboardComponent },
//       { path: 'published', component: PublishedComponent },
//       { path: 'scheduled', component: ScheduledComponent },
//     ],
//   },
//   {
//     path: 'it-admin',
//     canActivate: [roleGuard, authGuard],
//     data: { roles: ['IT_ADMIN'] },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: ItAdminDashboardComponent },
//     ],
//   },
//   {
//     path: 'super-admin',
//     canActivate: [roleGuard, authGuard],
//     data: { roles: ['SUPER_ADMIN'] },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: SuperAdminDashboardComponent },
//     ],
//   },
//   { path: 'notfound', component: PageNotFoundComponent },
//   { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
// ];
