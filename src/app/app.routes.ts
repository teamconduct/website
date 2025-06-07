import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';

export const routeNames = {
    signIn: $localize `:Route name of the sign-in page:sign-in`
};

export const routes: Routes = [
    { path: routeNames.signIn, component: SignInPage },
    { path: '', redirectTo: routeNames.signIn, pathMatch: 'full' }
];
