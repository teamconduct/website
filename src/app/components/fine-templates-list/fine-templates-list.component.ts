import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FineTemplate } from '../../types';
import { Sorting } from '../../types/Sorting';
import { DropdownModule } from 'primeng/dropdown';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FineTemplatesListElementComponent } from './fine-templates-list-element/fine-templates-list-element.component';
import { UserManagerService } from '../../services/user-manager.service';
import { FineTemplateDetailAddEditComponent } from './fine-template-detail-add-edit/fine-template-detail-add-edit.component';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { Observable } from '../../types/Observable';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-fine-templates-list',
    standalone: true,
    imports: [DropdownModule, DataViewModule, ButtonModule, FontAwesomeModule, FineTemplatesListElementComponent, FineTemplateDetailAddEditComponent, AsyncPipe],
    templateUrl: './fine-templates-list.component.html',
    styleUrl: './fine-templates-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplatesListComponent {

    public userManager = inject(UserManagerService);

    public teamDataManager = inject(TeamDataManagerService);

    public addFineTemplateDialogVisible: boolean = false;

    public sorting = new Sorting<'reason' | 'amount', FineTemplate>('reason', {
        reason: {
            label: $localize `:Dropdown label to sort fine template by reason:Sort by reason`,
            direction: 'letters'
        },
        amount: {
            label: $localize `:Dropdown label to sort fine template by amount:Sort by amount`,
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

    public get fineTemplates$(): Observable<FineTemplate[]> {
        return this.teamDataManager.fineTemplates$.map(fineTemplatesDict => {
            const fineTemplates = fineTemplatesDict.values;
            this.sorting.sort(fineTemplates);
            return fineTemplates;
        });
    }

    public fineTemplatesType(value: any): FineTemplate[] {
        return value;
    }

    public get canAddFineTemplate(): boolean {
        return this.userManager.hasRole('fineTemplate-add');
    }
}
