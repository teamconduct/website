import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Amount, PayedState, PersonId, PersonWithFines } from '../../../types';
import { FinesListComponent } from '../../fines-list/fines-list.component';
import { Tag, TagModule } from 'primeng/tag';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faWallet } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { DividerModule } from 'primeng/divider';
import { UserManagerService } from '../../../services/user-manager.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FineDetailAddEditComponent } from '../../fines-list/fine-detail-add-edit/fine-detail-add-edit.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { PersonAddEditComponent } from '../person-add-edit/person-add-edit.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-persons-list-element',
    standalone: true,
    imports: [FinesListComponent, TagModule, ConfirmPopupModule, PersonAddEditComponent, AmountPipe, FontAwesomeModule, DividerModule, ButtonModule, FineDetailAddEditComponent, DialogModule, SkeletonModule],
    providers: [ConfirmationService],
    templateUrl: './persons-list-element.component.html',
    styleUrl: './persons-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonsListElementComponent {

    @Input({ required: true }) public person!: PersonWithFines | null;

    @Input() public expanded: boolean = true;

    @Output() public readonly expandedChange = new EventEmitter<PersonId | null>();

    @Input() preview: boolean = false;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private confirmationService = inject(ConfirmationService);

    public editPersonDialogVisible: boolean = false;

    public addFineDialogVisible: boolean = false;

    public deleteLoading: boolean = false;

    public get personName(): string | null {
        if (this.person === null)
            return null;
        if (this.person.properties.lastName === null)
            return this.person.properties.firstName;
        return `${this.person.properties.firstName} ${this.person.properties.lastName}`;
    }

    public get payedTags(): Record<'total' | 'notPayed' | 'payed', { label: string, amount: Amount | null, severity: Tag['severity'], icon: IconDefinition }> {
        return {
            total: {
                label: $localize `:Label of totla amount:Total`,
                amount: this.person === null ? null : this.person.amounts.total,
                severity: 'info',
                icon: faWallet
            },
            notPayed:{
                label: $localize `:Label of not payed amount:Open`,
                amount: this.person === null ? null : this.person.amounts.notPayed,
                severity: PayedState.payedTag('notPayed').severity,
                icon: faEnvelopeOpen
            },
            payed: {
                label: $localize `:Label of payed amount:Paid`,
                amount: this.person === null ? null : this.person.amounts.payed,
                severity: PayedState.payedTag('payed').severity,
                icon: faEnvelope
            }
        };
    };

    public get canAddFine(): boolean {
        return this.userManager.hasRole('fine-add');
    }

    public get canEditPerson(): boolean {
        return this.userManager.hasRole('person-update');
    }

    public get canDeletePerson(): boolean {
        if (this.userManager.currentTeamId === null || this.userManager.signedInUser === null || !this.userManager.signedInUser.teams.has(this.userManager.currentTeamId))
            return false;
        if (this.person === null)
            return true;
        if (this.userManager.signedInUser.teams.get(this.userManager.currentTeamId).personId.guidString === this.person.id.guidString)
            return false;
        return this.userManager.hasRole('person-delete');
    }

    public get displayAmount(): { type: 'notPayed' | 'total', amount: Amount } | null {
        if (this.person === null)
            return null;
        if (this.person.amounts.notPayed.completeValue === 0)
            return {
                type: 'total',
                amount: this.person.amounts.total
            };
        return {
            type: 'notPayed',
            amount: this.person.amounts.notPayed
        };
    }

    public toggleExpanded(toVisible: boolean) {
        if (this.preview || this.person === null)
            return;
        this.expandedChange.emit(toVisible ? this.person.id : null);
    }

    public showDeleteConfirmation(event: Event) {
        if (this.person === null)
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
        if (this.userManager.currentTeamId === null || this.person === null)
            return;

        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.function('person').function('delete').call({
            teamId: this.userManager.currentTeamId,
            id: this.person.id
        });

        this.deleteLoading = false;
    }
}
