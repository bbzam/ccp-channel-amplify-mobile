import { Routes } from '@angular/router';
import { TheaterComponent } from './features/subscriber/theater/theater.component';
import { FilmComponent } from './features/subscriber/film/film.component';
import { MusicComponent } from './features/subscriber/music/music.component';
import { DanceComponent } from './features/subscriber/dance/dance.component';
import { EducationComponent } from './features/subscriber/education/education.component';
import { CcpspecialComponent } from './features/subscriber/ccpspecial/ccpspecial.component';
import { CcpclassicComponent } from './features/subscriber/ccpclassic/ccpclassic.component';
import { authGuard } from './auth/auth.guard';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { DashboardComponent } from './features/content-curator/dashboard/dashboard.component';
import { PublishedComponent } from './features/content-curator/published/published.component';
import { ScheduledComponent } from './features/content-curator/scheduled/scheduled.component';
import { PublicViewComponent } from './features/public-view/public-view/public-view.component';
import { HomeComponent } from './features/subscriber/home/home.component';
import { roleGuard } from './auth/role.guard';
import { ItAdminDashboardComponent } from './features/IT-admin/dashboard/dashboard.component';
import { SuperAdminDashboardComponent } from './features/super-admin/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
      { path: 'landing-page', component: PublicViewComponent },
    ],
  },
  {
    path: 'subscriber',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['SUBSCRIBER'] },
    children: [
      { path: '', component: HomeComponent },
      { path: 'theater', component: TheaterComponent },
      { path: 'film', component: FilmComponent },
      { path: 'music', component: MusicComponent },
      { path: 'dance', component: DanceComponent },
      { path: 'education', component: EducationComponent },
      { path: 'ccpspecial', component: CcpspecialComponent },
      { path: 'ccpclassic', component: CcpclassicComponent },
    ],
  },
  {
    path: 'content-curator',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['CONTENT_CREATOR'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'published', component: PublishedComponent },
      { path: 'scheduled', component: ScheduledComponent },
    ],
  },
  {
    path: 'it-admin',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['IT_ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ItAdminDashboardComponent},
    ],
  },
  {
    path: 'super-admin',
    canActivate: [roleGuard, authGuard],
    data: { roles: ['SUPER_ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: SuperAdminDashboardComponent},
    ],
  },
  { path: 'notfound', component: PageNotFoundComponent },
  { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
];
