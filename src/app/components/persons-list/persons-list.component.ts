import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamId } from '../../types/Team';
import { PersonId, PersonWithFines } from '../../types';
import { PersonsListElementComponent } from './persons-list-element/persons-list-element.component';
import { Sorting } from '../../types/Sorting';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-persons-list',
    standalone: true,
    imports: [PersonsListElementComponent, DataViewModule, DropdownModule, FontAwesomeModule, ButtonModule],
    templateUrl: './persons-list.component.html',
    styleUrl: './persons-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonsListComponent {

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true, alias: 'persons' }) public _persons!: PersonWithFines[];

    public expandedPersonId: PersonId | null = null;

    public sorting = new Sorting<'name' | 'payedState' | 'total' | 'notPayed', PersonWithFines>('name', {
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
                const lhsName = lhs.properties.lastName === null ? lhs.properties.firstName : `${lhs.properties.firstName} ${lhs.properties.lastName}`;
                const rhsName = rhs.properties.lastName === null ? rhs.properties.firstName : `${rhs.properties.firstName} ${rhs.properties.lastName}`;
                if (lhsName === rhsName)
                    return 'equal';
                return lhsName < rhsName ? 'less' : 'greater';
            },
            fallbacks: []
        },
        payedState: {
            compareFn: (lhs, rhs) => {
                const lhsAmount = lhs.amounts.payed.completeValue;
                const rhsAmount = rhs.amounts.payed.completeValue;
                if (lhsAmount === 0 && rhsAmount === 0)
                    return 'equal';
                if (lhsAmount !== 0 &&  rhsAmount !== 0)
                    return 'equal';
                if (lhsAmount === 0)
                    return 'less';
                return 'greater';
            },
            fallbacks: ['name']
        },
        total: {
            compareFn: (lhs, rhs) => {
                const lhsAmount = lhs.amounts.total.completeValue;
                const rhsAmount = rhs.amounts.total.completeValue;
                if (lhsAmount === rhsAmount)
                    return 'equal';
                return lhsAmount < rhsAmount ? 'less' : 'greater';
            },
            fallbacks: ['name']
        },
        notPayed: {
            compareFn: (lhs, rhs) => {
                const lhsAmount = lhs.amounts.notPayed.completeValue;
                const rhsAmount = rhs.amounts.notPayed.completeValue;
                if (lhsAmount === rhsAmount)
                    return 'equal';
                return lhsAmount < rhsAmount ? 'less' : 'greater';
            },
            fallbacks: ['name']
        }
    });

    public get persons(): PersonWithFines[] {
        this.sorting.sort(this._persons);
        return this._persons;
    }

    public personsType(value: any): PersonWithFines[] {
        return value;
    }
}
