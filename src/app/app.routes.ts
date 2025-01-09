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

export const routes: Routes = [
    { path: '', redirectTo: 'landing-page', pathMatch: 'full'},
    { path: '**', redirectTo: 'notfound', pathMatch: 'full'},
    { path: 'landing-page', component: HomePageComponent},
    { path: 'home', children: [
        {path: '', component: SubscriberComponent},
        {path: 'theater', component: TheaterComponent},
        {path: 'film', component: FilmComponent},
        {path: 'music', component: MusicComponent},
        {path: 'dance', component: DanceComponent},
        {path: 'education', component: EducationComponent},
        {path: 'ccpspecial', component: CcpspecialComponent},
        {path: 'ccpclassic', component: CcpclassicComponent},
    ]},
];
