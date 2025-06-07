import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { FunctionsErrorCodeCore } from '@angular/fire/functions';
import { User } from '@stevenkellner/team-conduct-api';
import { AuthenticationComponent } from '../../components/authentication/authentication.component';

@Component({
    selector: 'page-sign-in',
    imports: [AuthenticationComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage {

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    private route = inject(ActivatedRoute);

    public async handleSuccessfulSignIn(): Promise<string | null> {

        const invitationResult = await this.getInvitationAndNavigateToHome();
        if (invitationResult !== 'no-invitation')
            return invitationResult;

        const loginResult = await this.getUserAndNavigateToHome();
        if (loginResult !== 'not-found')
            return loginResult;

        // const navigationSuccessful = await this.router.navigate([`/${routeNames.createTeam}`]); TODO navigation to create team page
        // if (!navigationSuccessful)
        //     return $localize `:Error message that navigation to sign up page has failed:Failed to navigate to the sign up page.`;
        return null;
    }

    private async getInvitationAndNavigateToHome(): Promise<'no-invitation' | string | null> {
        const invitationId = this.route.snapshot.queryParamMap.get('code');
        if (invitationId === null)
            return 'no-invitation';
        try {
            const user = await this.firebaseFunctions.functions.invitation.register.execute(new Tagged(invitationId, 'invitation'));
            return await this.setUserAndNavigateToHome(user);
        } catch (error) {
            if ((error as FunctionsError).code as FunctionsErrorCodeCore === 'not-found')
                return $localize `:Error message that sign in has failed with invalid invitation code:Invitation code is invalid.`;
            if ((error as FunctionsError).code as FunctionsErrorCodeCore === 'already-exists')
                return $localize `:Error message that sign in has failed with already used invitation code:Invitation code has already been used.`;
            return $localize `:Error message that sign in has failed with invitation code:Failed to sign in with invitation code.`;
        }
    }

    private async getUserAndNavigateToHome(): Promise<'not-found' | string | null> {
        try {
            const user = await this.firebaseFunctions.functions.user.login.execute(null);
            return await this.setUserAndNavigateToHome(user);
        } catch (error) {
            if ((error as FunctionsError).code as FunctionsErrorCodeCore === 'not-found')
                return 'not-found';
            return $localize `:Error message that sign in has failed:Failed to sign in.`;
        }
    }

    private async setUserAndNavigateToHome(user: User): Promise<string | null> {
        this.userManager.setUser(user);
        if (!user.teams.isEmpty)
            this.userManager.setTeamId(user.teams.keys[0]);
        // const navigationSuccessful = await this.router.navigate([`/${appRoutes.home}`]); TODO navigation to home page
        // if (!navigationSuccessful)
        //     return  $localize `:Error message that navigation to home page has failed:Failed to navigate to the home page.`;
        return null;
    }
}
