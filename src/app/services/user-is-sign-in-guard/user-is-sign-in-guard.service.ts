import { inject, Injectable } from '@angular/core';
import { UserManagerService } from '../user-manager/user-manager.service';
import { Router } from '@angular/router';
import { routeNames } from '../../app.routes';

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
            void this.router.navigate([routeNames.signIn]);
            return false;
        }
        return true;
    }
}
