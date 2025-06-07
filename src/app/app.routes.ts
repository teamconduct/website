import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { CreateTeamPage } from './pages/create-team/create-team.page';

export const routeNames = {
    signIn: $localize `:Route name of the sign-in page:sign-in`,
    createTeam: $localize `:Route name of the create team page:create-team`,
};

export const routes: Routes = [
    { path: routeNames.signIn, component: SignInPage },
    { path: routeNames.createTeam, component: CreateTeamPage },
    { path: '', redirectTo: routeNames.signIn, pathMatch: 'full' }
];
