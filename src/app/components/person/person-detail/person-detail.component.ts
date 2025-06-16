import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { AsyncPipe } from '@angular/common';
import { Observable, SummedFineValue } from '../../../types';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { routeNames } from '../../../app.routes';
import { Invitation, PayedState } from '@stevenkellner/team-conduct-api';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { Tag, TagModule } from 'primeng/tag';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { FineListComponent } from '../../fine/fine-list/fine-list.component';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';

@Component({
    selector: 'app-person-detail',
    imports: [AsyncPipe, ButtonModule, ButtonGroupModule, ConfirmPopupModule, SkeletonModule, TagModule, FontAwesomeModule, FineAmountPipe, FineListComponent],
    providers: [ConfirmationService],
    templateUrl: './person-detail.component.html',
    styleUrl: './person-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonDetailComponent {

    public readonly person = input.required<PersonWithFines | null>();

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private confirmationService = inject(ConfirmationService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public deleteLoading: boolean = false;

    public get payedTags(): Record<'total' | 'notPayed' | 'payed', { label: string, value: SummedFineValue | null, severity: Tag['severity'], icon: IconDefinition }> {
        const person = this.person();
        return {
            total: {
                label: $localize `:Label of total amount:Total`,
                value: person === null ? null : person.fineValues.total,
                severity: 'info',
                icon: faWallet
            },
            notPayed:{
                label: $localize `:Label of not payed amount:Open`,
                value: person === null ? null : person.fineValues.notPayed,
                severity: PayedState.payedTag('notPayed').severity,
                icon: faEnvelopeOpen
            },
            payed: {
                label: $localize `:Label of payed amount:Paid`,
                value: person === null ? null : person.fineValues.payed,
                severity: PayedState.payedTag('payed').severity,
                icon: faEnvelope
            }
        };
    };

    public get canAddFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get canEditPerson$(): Observable<boolean> {
        return this.userManager.hasRole('person-manager');
    }

    public get canDeletePerson$(): Observable<boolean> {
        return Observable.combine(this.userManager.hasRole('person-manager'), this.userManager.currentPersonId$, (canDeletePerson, currentPersonId) => {
            const person = this.person();
            if (currentPersonId === null || person === null ||  person.id.guidString === currentPersonId.guidString)
                return false;
            return canDeletePerson;
        });
    }

    public get canInvitePerson$(): Observable<boolean> {
        const person = this.person();
        return this.userManager.hasRole('team-manager').map(isTeamManager => isTeamManager && person !== null && person.signInProperties === null);
    }

    public get paypalMeLink$(): Observable<string | null> {
        return Observable.combine(this.teamDataManager.team$, this.userManager.currentPersonId$, (team, currentPersonId) => {
            const person = this.person();
            if (currentPersonId === null || person === null || person.id.guidString !== currentPersonId.guidString)
                return null;
            if (team.paypalMeLink === null)
                return null;
            if (person.fineValues.notPayed.amount.completeValue === 0)
                return null;
            return `${team.paypalMeLink}/${person.fineValues.notPayed.amount.completeValue}EUR`;
        });
    }

    public showInvitationDialog(event: Event) {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        const person = this.person();
        if (selectedTeamId === null || person === null)
            return;
        let loadingCanceled = false;
        const loadingConfirmationDialog = this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: $localize `:Message to wait for invitation to be loading:Invitation is loading, please wait...`,
            acceptVisible: false,
            rejectLabel: $localize `:Label of the button to cancel the dialog:Cancel`,
            closeOnEscape: true,
            reject: () => loadingCanceled = true
        });
        void this.firebaseFunctions.functions.invitation.invite.execute(new Invitation(selectedTeamId, person.id)).then(invitationId => {
            loadingConfirmationDialog.close();
            if (loadingCanceled)
                return;
            const team = this.teamDataManager.team$.value;
            if (team === null)
                return;
            const baseUrl = `${location.protocol}//${location.hostname}${location.port !== '' ? (':' + location.port) : ''}`;
            const invitationLink = `${baseUrl}/${routeNames.signIn}?code=${invitationId.value}`;
            this.confirmationService.confirm({
                target: event.target as EventTarget,
                message: $localize `:Message to show when invitation was successful:Invitation was successful! Give this link to the person: ${invitationLink}`,
                rejectLabel: $localize `:Label of the button to close the dialog:Close`,
                acceptLabel: $localize `:Label of the button to copy invitation link and close the dialog:Copy link and Close`,
                closeOnEscape: true,
                accept: () => {
                    void navigator.clipboard.writeText($localize `:Text to copy invitation link:Hello ${person.name}, you have been invited to your team ${team.name} to manage the team fines. Click on the link to log in: ${invitationLink}`);
                }
            });
        });
    }

    public showDeleteConfirmation(event: Event) {
        if (this.person() === null)
            return;
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: $localize `:Message to ask for confirmation before deleting person:Are you sure you want to delete this person?`,
            closeOnEscape: true,
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deletePerson()
        });
    }

    public async deletePerson() {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        const person = this.person();
        if (selectedTeamId === null || person === null)
            return;

        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.functions.person.delete.execute({
            teamId: selectedTeamId,
            id: person.id
        });

        this.deleteLoading = false;
    }

    public showPersonEditDialog() {
        const person = this.person();
        if (person === null)
            return;
        this.popupDialogHandler.activate({
            type: 'personAddEdit',
            person: person.person
        });
    }

    public showFineAddDialog() {
        const person = this.person();
        if (person === null)
            return;
        this.popupDialogHandler.activate({
            type: 'fineAddEdit',
            personId: person.id,
            fine: null
        });
    }
}
