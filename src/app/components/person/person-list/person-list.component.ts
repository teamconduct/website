import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { personListSorting } from '../../../types/sorting/person-list-sorting';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { Observable } from '../../../types';
import { AsyncPipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { PersonListElementComponent } from '../person-list-element/person-list-element.component';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { fineListSorting } from '../../../types/sorting/fine-list-sorting';
import { configuration } from '../../../../environments/environment';

@Component({
    selector: 'app-person-list',
    imports: [AsyncPipe, DataViewModule, ButtonModule, SelectModule, InputGroupModule, ButtonGroupModule, FontAwesomeModule, PersonListElementComponent],
    templateUrl: './person-list.component.html',
    styleUrl: './person-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListComponent {

    public userManager = inject(UserManagerService);

    public teamDataManager = inject(TeamDataManagerService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public readonly personSelected = output<PersonWithFines>();

    public sorting = personListSorting;

    public get persons$(): Observable<PersonWithFines[]> {
        return this.teamDataManager.persons$.map(personsDict => {
            const persons = personsDict.values;
            this.sorting.sort(persons);
            return persons;
        });
    }

    public get skeletonPersons(): null[] {
        return new Array(10).fill(null);
    }

    public personsType(value: any): (PersonWithFines | null)[] {
        return value;
    }

    public get canSharePersonsText$(): Observable<boolean> {
        return this.userManager.hasRole('person-manager');
    }

    public get canAddPerson$(): Observable<boolean> {
        return this.userManager.hasRole('person-manager');
    }

    public async sharePersonsText() {

        // Get persons with unpayed fines
        const personsWithUnpayedFines = this.teamDataManager.persons$.map(personsDict => personsDict.values.filter(person => person.fines.some(fine => fine.payedState === 'notPayed'))).value;
        if (personsWithUnpayedFines === null || personsWithUnpayedFines.length === 0)
            return;

        // Sort persons by name
        const sorting = personListSorting;
        sorting.sortByKey = 'name';
        sorting.direction = 'ascending';
        sorting.sort(personsWithUnpayedFines);

        // Create share text
        const shareText = personsWithUnpayedFines.map(person => {

            // Get total amount text
            const totalAmountText = person.fineValues.notPayed.formatted(configuration);

            // Sort the fines by date
            const unpayedFines = person.fines.filter(fine => fine.payedState === 'notPayed');
            const sorting = fineListSorting;
            sorting.sortByKey = 'date';
            sorting.direction = 'ascending';
            sorting.sort(unpayedFines);

            // Get fines text
            const finesText = unpayedFines.map(fine => {
                const date = fine.date.toDate.toLocaleDateString(configuration.locale, { year: 'numeric', month: '2-digit', day: '2-digit' });
                return `\t- ${fine.reason}, ${date}: ${fine.amount.formatted(configuration)}`;
            }).join('\n');

            return `${person.name}: ${totalAmountText}\n${finesText}`;
        }).join('\n\n');

        console.log('Share text:', shareText);

        try {
            await navigator.share({
                title: 'Share Persons',
                text: shareText
            });
        } catch {
            void navigator.clipboard.writeText(shareText);
        }
    }

    public addPersonClicked() {
        this.popupDialogHandler.activate({
            type: 'personAddEdit',
            person: null
        });
    }

    public get payedTagDisplay(): 'default' | 'notPayed' | 'payed' | 'total' {
        if (this.sorting.sortByKey === 'total')
            return 'total';
        return 'default';
    }
}
