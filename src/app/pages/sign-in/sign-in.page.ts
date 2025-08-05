import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { FunctionsErrorCodeCore } from '@angular/fire/functions';
import { Person, PersonPrivateProperties, Team, User } from '@stevenkellner/team-conduct-api';
import { AuthenticationComponent } from '../../components/authentication/authentication.component';
import { routeNames } from '../../app.routes';
import { Title } from '@angular/platform-browser';
import { InvitationPersonSelectionComponent } from '../../components/invitation-person-selection/invitation-person-selection.component';

@Component({
    selector: 'page-sign-in',
    imports: [AuthenticationComponent, InvitationPersonSelectionComponent],
    templateUrl: './sign-in.page.html',
    styleUrl: './sign-in.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInPage implements OnInit {

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    private route = inject(ActivatedRoute);

    private titleService = inject(Title);

    public invitationId = '';

    public teamInvitationProperties: {
        teamId: Team.Id,
        teamName: string,
        persons: {
            id: Person.Id,
            properties: PersonPrivateProperties
        }[]
    } | null = null;

    public ngOnInit() {
        this.titleService.setTitle($localize `:Title for the sign in page:Sign In`);
        // this.firebaseAuth.onAuthStateChanged(async _user => {
        //     if (_user !== null) {
        //         const user = await this.firebaseFunctions.functions.user.login.execute(null);
        //         this.userManager.setUser(user);
        //     }
        // });
        this.invitationId = this.route.snapshot.queryParamMap.get('code') ?? '';
    }

    public async handleSuccessfulSignIn(): Promise<string | null> {

        const loginResult = await this.getUserAndNavigateToHome();
        if (loginResult !== 'not-found')
            return loginResult;

        const invitationResult = await this.getInvitationAndNavigateToHome();
        if (invitationResult !== 'no-invitation')
            return invitationResult;

        const navigationSuccessful = await this.router.navigate([`/${routeNames.createTeam}`]);
        if (!navigationSuccessful)
            return $localize `:Error message that navigation to sign up page has failed:Failed to navigate to the sign up page.`;
        return null;
    }

    private async getInvitationAndNavigateToHome(): Promise<'no-invitation' | string | null> {
        if (this.invitationId === '')
            return 'no-invitation';
        try {
            const invitation = await this.firebaseFunctions.functions.invitation.getInvitation.execute(new Tagged(this.invitationId, 'invitation'));
            if (invitation.personId !== null) {
                const user = await this.firebaseFunctions.functions.invitation.register.execute({
                    teamId: invitation.teamId,
                    personId: invitation.personId,
                });
                return await this.setUserAndNavigateToHome(user);
            } else if (invitation.persons !== null && invitation.persons.length > 0) {
                this.teamInvitationProperties = {
                    teamId: invitation.teamId,
                    teamName: invitation.teamName,
                    persons: invitation.persons
                };
                this.teamInvitationProperties.persons.sort((lhs, rhs) => {
                    const lhsName = (lhs.properties.lastName === null ? lhs.properties.firstName : `${lhs.properties.firstName} ${lhs.properties.lastName}`).toUpperCase();
                    const rhsName = (rhs.properties.lastName === null ? rhs.properties.firstName : `${rhs.properties.firstName} ${rhs.properties.lastName}`).toUpperCase();
                    if (lhsName === rhsName)
                        return 0;
                    return lhsName < rhsName ? -1 : 1;
                });
                return null;
            }
            return 'no-invitation';
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
        const navigationSuccessful = await this.router.navigate([`/${routeNames.home}`]);
        if (!navigationSuccessful)
            return  $localize `:Error message that navigation to home page has failed:Failed to navigate to the home page.`;
        return null;
    }

    public cancelInvitationPersonSelection() {
        this.teamInvitationProperties = null;
    }
}
