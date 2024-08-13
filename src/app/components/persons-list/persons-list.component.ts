import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PersonId, PersonWithFines } from '../../types';
import { PersonsListElementComponent } from './persons-list-element/persons-list-element.component';
import { Sorting } from '../../types/Sorting';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { UserManagerService } from '../../services/user-manager.service';
import { PersonAddEditComponent } from './person-add-edit/person-add-edit.component';
import { Observable } from '../../types/Observable';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { AsyncPipe } from '@angular/common';
import { SummedFineValue } from '../../types/SummedFineValue';

@Component({
    selector: 'app-persons-list',
    standalone: true,
    imports: [PersonsListElementComponent, DataViewModule, DropdownModule, FontAwesomeModule, ButtonModule, PersonAddEditComponent, AsyncPipe],
    templateUrl: './persons-list.component.html',
    styleUrl: './persons-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonsListComponent {

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    public expandedPersonId: PersonId | null = null;

    public addPersonDialogVisible: boolean = false;

    public sorting = new Sorting<'name' | 'payedState' | 'total' | 'notPayed', PersonWithFines>('payedState', {
        name: {
            label: $localize `:Dropdown label to sort persons by name:Sort by name`,
            direction: 'letters'
        },
        payedState: {
            label: $localize `:Dropdown label to sort persons by payed state:Sort by paid state`,
            direction: 'basic'

        },
        total: {
            label: $localize `:Dropdown label to sort persons by total amount:Sort by total amount`,
            direction: 'numbers'
        },
        notPayed: {
            label: $localize `:Dropdown label to sort persons by not payed amount:Sort by open amount`,
            direction: 'numbers'
        }
    }, {
        name: {
            compareFn: (lhs, rhs) => {
                const lhsName = (lhs.properties.lastName === null ? lhs.properties.firstName : `${lhs.properties.firstName} ${lhs.properties.lastName}`).toUpperCase();
                const rhsName = (rhs.properties.lastName === null ? rhs.properties.firstName : `${rhs.properties.firstName} ${rhs.properties.lastName}`).toUpperCase();
                if (lhsName === rhsName)
                    return 'equal';
                return lhsName < rhsName ? 'less' : 'greater';
            },
            fallbacks: []
        },
        payedState: {
            compareFn: (lhs, rhs) => {
                if (lhs.fineValues.payed.isZero && rhs.fineValues.payed.isZero)
                    return 'equal';
                if (!lhs.fineValues.payed.isZero && !rhs.fineValues.payed.isZero)
                    return 'equal';
                if (lhs.fineValues.payed.isZero)
                    return 'greater';
                return 'less';
            },
            fallbacks: ['name']
        },
        total: {
            compareFn: (lhs, rhs) => SummedFineValue.compare(lhs.fineValues.total, rhs.fineValues.total),
            fallbacks: ['name']
        },
        notPayed: {
            compareFn: (lhs, rhs) => SummedFineValue.compare(lhs.fineValues.notPayed, rhs.fineValues.notPayed),
            fallbacks: ['name']
        }
    });

    public get persons$(): Observable<PersonWithFines[]> {
        return this.teamDataManager.persons$.map(personsDict => {
            const persons = personsDict.values;
            this.sorting.sort(persons);
            return persons;
        });
    }

    public get nullPersons(): null[] {
        return new Array(10).fill(null);
    }

    public personsType(value: any): (PersonWithFines | null)[] {
        return value;
    }

    public get canAddPerson(): boolean {
        return this.userManager.hasRole('person-add');
    }
}
