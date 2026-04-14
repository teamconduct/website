import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from '@angular/core';
import { UserDashboardFinesStatsComponent } from './stats-items/user-dashboard-fines-stats/user-dashboard-fines-stats.component';
import { UserDashboardOpenFinesPerTeamStatsComponent } from './stats-items/user-dashboard-open-fines-per-team-stats/user-dashboard-open-fines-per-team-stats.component';
import { UserDashboardFinesPerIntervalStatsComponent } from './stats-items/user-dashboard-fines-per-interval-stats/user-dashboard-fines-per-interval-stats.component';
import { UserDashboardFineFrequencyStatsComponent } from './stats-items/user-dashboard-fine-frequency-stats/user-dashboard-fine-frequency-stats.component';
import { TeamDashboardOpenFinesStatsComponent } from './stats-items/team-dashboard-open-fines-stats/team-dashboard-open-fines-stats.component';
import { TeamDashboardOpenFinesCountStatsComponent } from './stats-items/team-dashboard-open-fines-count-stats/team-dashboard-open-fines-count-stats.component';
import { TeamDashboardMostFinedPersonStatsComponent } from './stats-items/team-dashboard-most-fined-person-stats/team-dashboard-most-fined-person-stats.component';
import { TeamDashboardPayedFineStatsComponent } from './stats-items/team-dashboard-payed-fine-stats/team-dashboard-payed-fine-stats.component';
import { AsyncPipe } from '@angular/common';
import { AppStateManagerService } from '../../services/app-state-manager/app-state-manager.service';

@Component({
    selector: 'app-dashboard-stats',
    imports: [
        UserDashboardFinesStatsComponent,
        UserDashboardOpenFinesPerTeamStatsComponent,
        UserDashboardFinesPerIntervalStatsComponent,
        UserDashboardFineFrequencyStatsComponent,
        TeamDashboardOpenFinesStatsComponent,
        TeamDashboardOpenFinesCountStatsComponent,
        TeamDashboardMostFinedPersonStatsComponent,
        TeamDashboardPayedFineStatsComponent,
        AsyncPipe
    ],
    templateUrl: './dashboard-stats.component.html',
    styleUrl: './dashboard-stats.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class DashboardStatsComponent {

    public type = input.required<'user' | 'team'>();

    public readonly appStateManager = inject(AppStateManagerService);
}
