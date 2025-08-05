import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { Person, PersonPrivateProperties, Team, User } from '@stevenkellner/team-conduct-api';
import { routeNames } from '../../app.routes';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-invitation-person-selection',
    imports: [CardModule, ButtonGroupModule, ButtonModule, FontAwesomeModule, ErrorMessageComponent],
    templateUrl: './invitation-person-selection.component.html',
    styleUrl: './invitation-person-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationPersonSelectionComponent {

    public teamInvitationProperties = input.required<{
        teamId: Team.Id,
        teamName: string,
        persons: {
            id: Person.Id,
            properties: PersonPrivateProperties
        }[]
    }>();

    public onCancel = output<void>();

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private router = inject(Router);

    public selectedPersonId: Person.Id | null = null;

    public registrationLoading = false;

    public registrationError: string | null = null;

    public async selectPerson(person: {id: Person.Id, properties: PersonPrivateProperties}): Promise<void> {
        this.selectedPersonId = person.id;
        this.registrationLoading = true;
        this.registrationError = null;

        try {
            const user = await this.firebaseFunctions.functions.invitation.register.execute({
                teamId: this.teamInvitationProperties().teamId,
                personId: person.id,
            });

            this.userManager.setUser(user);
            const navigationSuccessful = await this.router.navigate([`/${routeNames.home}`]);
            if (!navigationSuccessful)
                this.registrationError = $localize `:Error message that navigation to home page has failed:Failed to navigate to the home page.`;
        } catch (error) {
            this.registrationError = $localize`:Error message that registration has failed:Registration failed. Please try again.`;
        } finally {
            this.registrationLoading = false;
        }
    }

    public cancelInvitationPersonSelection(): void {
        this.selectedPersonId = null;
        this.registrationError = null;
        this.onCancel.emit();
    }
}
