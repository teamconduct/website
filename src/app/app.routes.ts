import { Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { UserDashboardPage } from './pages/user-dashboard/user-dashboard.page';

export const routeNames = {
    signIn: $localize `:Route name of the sign-in page:sign-in`,
    userDashboard: $localize `:Route name of the user dashboard page:dashboard`
};

export const routes: Routes = [
    { path: routeNames.signIn, component: SignInPage },
    { path: routeNames.userDashboard, component: UserDashboardPage },
    { path: '', redirectTo: routeNames.userDashboard, pathMatch: 'full' },
    { path: '**', redirectTo: routeNames.userDashboard, pathMatch: 'full' }
];
