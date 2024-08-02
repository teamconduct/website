import { Router, Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { CreateTeamOrRegisterInvitationPage } from './pages/create-team-or-register-invitation/create-team-or-register-invitation.page';
import { inject, Injectable } from '@angular/core';
import { UserManagerService } from './services/user-manager.service';
import { HomePage } from './pages/home/home.page';

@Injectable({
    providedIn: 'root'
})
export class UserIsSignInGuardService {

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    public canActivate(): boolean {
        const user = this.userManager.signedInUser;
        if (!user) {
            void this.router.navigate([appRoutes.signIn]);
            return false;
        }
        return true;
    }
}

export const appRoutes = {
    signIn: $localize `:Internal path to sign in page:sign-in`,
    signUp: $localize `:Internal path to sign up page:sign-up`,
    home: $localize `:Internal path to home page:home`
};

export const routes: Routes = [
    { path: appRoutes.signIn, component: SignInPage },
    { path: appRoutes.signUp, component: CreateTeamOrRegisterInvitationPage },
    { path: appRoutes.home, component: HomePage, canActivate: [UserIsSignInGuardService] },
    { path: '', pathMatch: 'full', redirectTo: appRoutes.signIn },
    { path: '**', pathMatch: 'full', redirectTo: appRoutes.home }
];
