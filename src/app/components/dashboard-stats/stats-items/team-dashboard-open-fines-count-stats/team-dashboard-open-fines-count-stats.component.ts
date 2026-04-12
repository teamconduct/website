import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { compactMap, Dictionary } from '@stevenkellner/typescript-common-functionality';
import { Fine, PayedState } from '@stevenkellner/team-conduct-api';
import { SummedFineValue } from '../../../../types';

@Component({
    selector: 'app-team-dashboard-open-fines-count-stats',
    imports: [AsyncPipe, FaIconComponent],
    templateUrl: './team-dashboard-open-fines-count-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboardOpenFinesCountStatsComponent {

    public dataManager = inject(DataManagerService);

    public readonly faClockRotateLeft = faClockRotateLeft;

    public getOpenFinesCount(fines: Dictionary<Fine.Id, Fine>): number {
        return compactMap(fines.values, fine => fine.payedState instanceof PayedState.NotPayed ? 1 : null)
            .reduce((acc, count) => acc + count, 0);
    };
}
