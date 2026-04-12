import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPiggyBank } from '@fortawesome/free-solid-svg-icons';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { SummedFineValue } from '../../../../types';
import { compactMap, Dictionary } from '@stevenkellner/typescript-common-functionality';
import { Fine, PayedState } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-team-dashboard-payed-fine-stats',
    imports: [FineAmountPipe, FaIconComponent, AsyncPipe],
    templateUrl: './team-dashboard-payed-fine-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboardPayedFineStatsComponent {

    public dataManager = inject(DataManagerService);

    public readonly faPiggyBank = faPiggyBank;

    public getPayedFines(fines: Dictionary<Fine.Id, Fine>): SummedFineValue {
        return compactMap(fines.values, fine => fine.payedState instanceof PayedState.Payed ? fine.amount : null)
            .reduce((acc, fineAmount) => acc.added(fineAmount), new SummedFineValue());
    };
}
