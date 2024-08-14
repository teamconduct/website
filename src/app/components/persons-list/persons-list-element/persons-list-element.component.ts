import { combine, Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PayedState, Person, PersonId, PersonWithFines } from '../../../types';
import { FinesListComponent } from '../../fines-list/fines-list.component';
import { Tag, TagModule } from 'primeng/tag';
import { FineValuePipe } from '../../../pipes/fineValue.pipe';
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
import { SummedFineValue } from '../../../types/SummedFineValue';
import { TeamDataManagerService } from '../../../services/team-data-manager.service';
import { AsyncPipe } from '../../../pipes/async.pipe';

@Component({
    selector: 'app-persons-list-element',
    standalone: true,
    imports: [FinesListComponent, TagModule, ConfirmPopupModule, PersonAddEditComponent, FineValuePipe, FontAwesomeModule, DividerModule, ButtonModule, FineDetailAddEditComponent, DialogModule, SkeletonModule, AsyncPipe],
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

    private teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private confirmationService = inject(ConfirmationService);

    public editPersonDialogVisible: boolean = false;

    public addFineDialogVisible: boolean = false;

    public deleteLoading: boolean = false;

    public get personName(): string | null {
        if (this.person === null)
            return null;
        return Person.name(this.person);
    }

    public get payedTags(): Record<'total' | 'notPayed' | 'payed', { label: string, value: SummedFineValue | null, severity: Tag['severity'], icon: IconDefinition }> {
        return {
            total: {
                label: $localize `:Label of total amount:Total`,
                value: this.person === null ? null : this.person.fineValues.total,
                severity: 'info',
                icon: faWallet
            },
            notPayed:{
                label: $localize `:Label of not payed amount:Open`,
                value: this.person === null ? null : this.person.fineValues.notPayed,
                severity: PayedState.payedTag('notPayed').severity,
                icon: faEnvelopeOpen
            },
            payed: {
                label: $localize `:Label of payed amount:Paid`,
                value: this.person === null ? null : this.person.fineValues.payed,
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
        return combine(this.userManager.hasRole('person-manager'), this.userManager.currentPersonId$, (canDeletePerson, currentPersonId) => {
            if (this.person === null || currentPersonId === null || this.person.id.guidString === currentPersonId.guidString)
                return false;
            return canDeletePerson;
        });
    }

    public get displayValue(): { type: 'notPayed' | 'total', value: SummedFineValue } | null {
        if (this.person === null)
            return null;
        if (this.person.fineValues.notPayed.isZero)
            return {
                type: 'total',
                value: this.person.fineValues.total
            };
        return {
            type: 'notPayed',
            value: this.person.fineValues.notPayed
        };
    }

    public get paypalMeLink$(): Observable<string | null> {
        return combine(this.teamDataManager.team$, this.userManager.currentPersonId$, (team, currentPersonId) => {
            if (this.person === null || currentPersonId === null || this.person.id.guidString !== currentPersonId.guidString)
                return null;
            if (team.paypalMeLink === null)
                return null;
            return `${team.paypalMeLink}/${this.person.fineValues.notPayed.amount.completeValue}EUR`;

        });
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
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null || this.person === null)
            return;

        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.function('person').function('delete').call({
            teamId: selectedTeamId,
            id: this.person.id
        });

        this.deleteLoading = false;
    }
}
