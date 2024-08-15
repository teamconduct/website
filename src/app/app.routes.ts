import { Router, Routes } from '@angular/router';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { inject, Injectable } from '@angular/core';
import { UserManagerService } from './services/user-manager.service';
import { HomePage } from './pages/home/home.page';
import { CreateTeamPage } from './pages/create-team/create-team.page';

@Injectable({
    providedIn: 'root'
})
export class UserIsSignInGuardService {

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    public canActivate(): boolean {
        this.userManager.getAllCookies();
        const user = this.userManager.user$.value;
        if (!user) {
            void this.router.navigate([appRoutes.signIn]);
            return false;
        }
        return true;
    }
}

export const appRoutes = {
    signIn: $localize `:Internal path to sign in page:sign-in`,
    createTeam: $localize `:Internal path to create team page:create-team`,
    home: $localize `:Internal path to home page:home`
};

export const routes: Routes = [
    { path: appRoutes.signIn, component: SignInPage },
    { path: appRoutes.createTeam, component: CreateTeamPage },
    { path: appRoutes.home, component: HomePage, canActivate: [UserIsSignInGuardService] },
    { path: '', pathMatch: 'full', redirectTo: appRoutes.signIn },
    { path: '**', pathMatch: 'full', redirectTo: appRoutes.home }
];
