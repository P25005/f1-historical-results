import { Routes } from '@angular/router';
import { Home } from './view/home/home';
import { Rankings } from './view/rankings/rankings';
import { RaceDetails } from './view/race-details/race-details';

import { History } from './view/history/history';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'rankings', component: Rankings },
    // ruta parametritzada amb any i ronda
    { path: 'race/:year/:round', component: RaceDetails },
    { path: 'history', component: History },
    // si posem una ruta que no existeix, tornem a casa
    { path: '**', redirectTo: '' }
];
