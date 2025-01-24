import { Routes } from '@angular/router';
import { HomePageComponent } from './features/public-view/home-page/home-page.component';
import { SubscriberComponent } from './features/subscriber/subscriber/subscriber.component';
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
import { ContentCuratorComponent } from './features/content-curator/content-curator.component';

export const routes: Routes = [
  { path: 'notfound', component: PageNotFoundComponent },
  { path: 'landing-page', component: HomePageComponent },
  {
    path: 'subscriber',
    canActivate: [authGuard],
    children: [
      { path: '', component: SubscriberComponent },
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
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent},
      { path: 'published', component: PublishedComponent},
      { path: 'scheduled', component: ScheduledComponent},
    ]
  },
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' },  
  { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
];
