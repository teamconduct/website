import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { CreateTeamPage } from './pages/create-team/create-team.page';
import { HomePage } from './pages/home/home.page';

export const routeNames = {
    signIn: $localize `:Route name of the sign-in page:sign-in`,
    createTeam: $localize `:Route name of the create team page:create-team`,
    home: $localize `:Route name of the home page:home`
};

export const routes: Routes = [
    { path: routeNames.signIn, component: SignInPage },
    { path: routeNames.createTeam, component: CreateTeamPage },
    { path: routeNames.home, component: HomePage },
    { path: '', redirectTo: routeNames.home, pathMatch: 'full' },
    { path: '**', redirectTo: routeNames.home, pathMatch: 'full' }
];
