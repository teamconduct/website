import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Fine, PersonId } from '../../types';
import { DataViewModule } from 'primeng/dataview';
import { FinesListElementComponent } from './fines-list-element/fines-list-element.component';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Sorting } from '../../types/Sorting';
import { Observable } from '../../types/Observable';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { AsyncPipe } from '../../pipes/async.pipe';

@Component({
    selector: 'app-fines-list',
    standalone: true,
    imports: [DataViewModule, FinesListElementComponent, DropdownModule, ButtonModule, FontAwesomeModule, AsyncPipe],
    templateUrl: './fines-list.component.html',
    styleUrl: './fines-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListComponent {

    @Input({ required: true }) public personId!: PersonId;

    @Input() public isPreview: boolean = false;

    public teamDataManager = inject(TeamDataManagerService);

    public showAll: boolean = false;

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
                const lhsReason = lhs.reason.toUpperCase();
                const rhsReason = rhs.reason.toUpperCase();
                if (lhsReason === rhsReason)
                    return 'equal';
                return lhsReason < rhsReason ? 'less' : 'greater';
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
            fallbacks: ['date', 'reason']
        },
        date: {
            compareFn: (lhs, rhs) => {
                const value = lhs.date.compare(rhs.date);
                if (value === 'equal')
                    return 'equal';
                return value === 'less' ? 'greater' : 'less';
            },
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

    public get fines$(): Observable<{ list: Fine[], hasMore: boolean } | null> {
        return this.teamDataManager.persons$.map(persons => {
            if (!persons.has(this.personId))
                return null;
            const fines = persons.get(this.personId).fines;
            this.sorting.sort(fines);
            return {
                list: fines.slice(0, this.isPreview && !this.showAll ? 3 : undefined),
                hasMore: fines.length > 3
            };
        });
    }

    public finesType(value: any): Fine[] {
        return value;
    }
}
