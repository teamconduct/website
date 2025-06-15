import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { personListSorting } from '../../../types/sorting/person-sorting';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { Observable } from '../../../types';
import { AsyncPipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { PersonListElementComponent } from '../person-list-element/person-list-element.component';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
    selector: 'app-person-list',
    imports: [AsyncPipe, DataViewModule, ButtonModule, SelectModule, InputGroupModule, FontAwesomeModule, PersonListElementComponent],
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

    public get canAddPerson$(): Observable<boolean> {
        return this.userManager.hasRole('person-manager');
    }

    public addPersonClicked() {
        this.popupDialogHandler.activate({
            type: 'personAddEdit',
            person: null
        });
    }
}
