import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Fine, PersonId } from '../../types';
import { DataViewModule } from 'primeng/dataview';
import { FinesListElementComponent } from './fines-list-element/fines-list-element.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Sorting } from '../../types/Sorting';
import { TeamId } from '../../types/Team';

@Component({
    selector: 'app-fines-list',
    standalone: true,
    imports: [DataViewModule, FinesListElementComponent, DropdownModule, ButtonModule, FontAwesomeModule],
    templateUrl: './fines-list.component.html',
    styleUrl: './fines-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListComponent {

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true, alias: 'fines' }) public _fines!: Fine[];

    @Input() public maxFines: number | null = null;

    public sorting = new Sorting<'reason' | 'payed' | 'date' | 'amount', Fine>('payed', {
        reason: {
            label: $localize `:Dropdown label to sort fine by reason:Sort by reason`,
            direction: 'letters'
        },
        payed: {
            label: $localize `:Dropdown label to sort fine by payed state:Sort by paid state`,
            direction: 'basic'
        },
        date: {
            label: $localize `:Dropdown label to sort fine by date:Sort by date`,
            direction: 'basic'
        },
        amount: {
            label: $localize `:Dropdown label to sort fine by amount:Sort by amount`,
            direction: 'numbers'
        }
    }, {
        reason: {
            compareFn: (lhs, rhs) => {
                if (lhs.reason === rhs.reason)
                    return 'equal';
                return lhs.reason < rhs.reason ? 'less' : 'greater';
            },
            fallbacks: []
        },
        payed: {
            compareFn: (lhs, rhs) => {
                if (lhs.payedState === rhs.payedState)
                    return 'equal';
                if (lhs.payedState === 'notPayed')
                    return 'less';
                return 'greater';
            },
            fallbacks: ['reason']
        },
        date: {
            compareFn: (lhs, rhs) => lhs.date.compare(rhs.date),
            fallbacks: ['reason']
        },
        amount: {
            compareFn: (lhs, rhs) => {
                const lhsAmount = lhs.amount.completeValue;
                const rhsAmount = rhs.amount.completeValue;
                if (lhsAmount === rhsAmount)
                    return 'equal';
                return lhsAmount < rhsAmount ? 'less' : 'greater';
            },
            fallbacks: ['reason']
        }
    });

    public get fines(): Fine[] {
        const fines = this._fines.slice(0, this.maxFines ?? undefined);
        this.sorting.sort(fines);
        return fines;
    }

    public finesType(value: any): Fine[] {
        return value;
    }
}
