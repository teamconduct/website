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
import { FineValue } from '../../types/FineValue';

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

    public sorting = new Sorting<'reason' | 'value', FineTemplate>('reason', {
        reason: {
            label: $localize `:Dropdown label to sort fine template by reason:Sort by reason`,
            direction: 'letters'
        },
        value: {
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
        value: {
            compareFn: (lhs, rhs) => FineValue.compare(lhs.value, rhs.value),
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

    public get nullFineTemplates(): null[] {
        return new Array(10).fill(null);
    }

    public fineTemplatesType(value: any): (FineTemplate | null)[] {
        return value;
    }

    public get canAddFineTemplate(): boolean {
        return this.userManager.hasRole('fineTemplate-add');
    }
}
