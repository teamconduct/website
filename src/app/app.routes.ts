import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { CreateTeamOrRegisterInvitationPage } from './pages/create-team-or-register-invitation/create-team-or-register-invitation.page';

export const routes: Routes = [
    { path: 'sign-in', component: SignInPage },
    { path: 'sign-up', component: CreateTeamOrRegisterInvitationPage },
    { path: '', pathMatch: 'full', redirectTo: 'sign-up' },
    { path: '**', pathMatch: 'full', redirectTo: '' }
];
