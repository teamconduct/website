import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSignInComponent } from '../../components/auth-sign-in/auth-sign-in.component';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';
import { FunctionsError, FunctionsErrorCodeCore } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { appRoutes } from '../../app.routes';
import { UserManagerService } from '../../services/user-manager.service';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, AuthSignInComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {

    private firebaseFunctionsService = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    public async handleSuccessfulSignIn(): Promise<string | null> {
        try {
            const user = await this.firebaseFunctionsService.function('user').function('login').call(null);
            this.userManager.signedInUser = user;
            const navigationSuccessful = await this.router.navigate([`/${appRoutes.home}`]);
            if (!navigationSuccessful)
                return $localize `:Error message that navigation to home page has failed:Failed to navigate to the home page.`;
            return null;
        } catch (error) {
            if ((error as FunctionsError).code as FunctionsErrorCodeCore === 'not-found') {
                const navigationSuccessful = await this.router.navigate([`/${appRoutes.signUp}`]);
                if (!navigationSuccessful)
                    return $localize `:Error message that navigation to sign up page has failed:Failed to navigate to the sign up page.`;
                return null;
            }
            return $localize `:Error message that sign in has failed:Failed to sign in.`;
        }
    }
}
