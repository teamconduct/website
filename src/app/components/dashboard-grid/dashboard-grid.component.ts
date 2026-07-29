import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UserFinesCellComponent } from './cells/user-fines-cell/user-fines-cell.component';
import { UserOpenFinesPerTeamCellComponent } from './cells/user-open-fines-per-team-cell/user-open-fines-per-team-cell.component';
import { UserFineFrequencyCellComponent } from './cells/user-fine-frequency-cell/user-fine-frequency-cell.component';
import { UserFinesPerIntervalCellComponent } from './cells/user-fines-per-interval-cell/user-fines-per-interval-cell.component';
import { UserQuickActionsCellComponent } from './cells/user-quick-actions-cell/user-quick-actions-cell.component';
import { TeamOpenFinesCellComponent } from './cells/team-open-fines-cell/team-open-fines-cell.component';
import { TeamOpenFinesCountCellComponent } from './cells/team-open-fines-count-cell/team-open-fines-count-cell.component';
import { TeamMostFinedCellComponent } from './cells/team-most-fined-cell/team-most-fined-cell.component';
import { TeamPayedFinesCellComponent } from './cells/team-payed-fines-cell/team-payed-fines-cell.component';
import { TeamQuickLinksCellComponent } from './cells/team-quick-links-cell/team-quick-links-cell.component';

@Component({
    selector: 'app-dashboard-grid',
    standalone: true,
    imports: [
        UserFinesCellComponent,
        UserOpenFinesPerTeamCellComponent,
        UserFineFrequencyCellComponent,
        UserFinesPerIntervalCellComponent,
        UserQuickActionsCellComponent,
        TeamOpenFinesCellComponent,
        TeamOpenFinesCountCellComponent,
        TeamMostFinedCellComponent,
        TeamPayedFinesCellComponent,
        TeamQuickLinksCellComponent
    ],
    templateUrl: './dashboard-grid.component.html',
    styleUrl: './dashboard-grid.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardGridComponent {

    public type = input.required<'user' | 'team'>();
}
