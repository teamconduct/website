import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthSignInComponent } from '../../components/auth-sign-in/auth-sign-in.component';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';
import { FunctionsError, FunctionsErrorCodeCore } from '@angular/fire/functions';
import { ActivatedRoute, Router } from '@angular/router';
import { appRoutes } from '../../app.routes';
import { UserManagerService } from '../../services/user-manager.service';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { User } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-sign-in',
    standalone: true,
    imports: [CommonModule, AuthSignInComponent],
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

        const navigationSuccessful = await this.router.navigate([`/${appRoutes.createTeam}`]);
        if (!navigationSuccessful)
            return $localize `:Error message that navigation to sign up page has failed:Failed to navigate to the sign up page.`;
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
        const navigationSuccessful = await this.router.navigate([`/${appRoutes.home}`]);
        if (!navigationSuccessful)
            return  $localize `:Error message that navigation to home page has failed:Failed to navigate to the home page.`;
        return null;
    }
}
