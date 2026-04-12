import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { Observable, SummedFineValue } from '../../../../types';
import { compactMap, Dictionary } from '@stevenkellner/typescript-common-functionality';
import { Fine, PayedState } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-team-dashboard-open-fines-stats',
    imports: [FineAmountPipe, AsyncPipe, FaIconComponent],
    templateUrl: './team-dashboard-open-fines-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboardOpenFinesStatsComponent {

    public dataManager = inject(DataManagerService);

    public readonly faFileInvoice = faFileInvoice;

    public getOpenFines(fines: Dictionary<Fine.Id, Fine>): SummedFineValue {
        return compactMap(fines.values, fine => fine.payedState instanceof PayedState.NotPayed ? fine.amount : null)
            .reduce((acc, fineAmount) => acc.added(fineAmount), new SummedFineValue());
    };
}
