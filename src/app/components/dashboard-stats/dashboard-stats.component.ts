import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { SummedFineValue } from '../../types';
import { PersonProperties } from '@stevenkellner/team-conduct-api';
import { UserDashboardFinesStatsComponent } from './stats-items/user-dashboard-fines-stats/user-dashboard-fines-stats.component';
import { UserDashboardOpenFinesPerTeamStatsComponent } from './stats-items/user-dashboard-open-fines-per-team-stats/user-dashboard-open-fines-per-team-stats.component';
import { UserDashboardFinesPerIntervalStatsComponent } from './stats-items/user-dashboard-fines-per-interval-stats/user-dashboard-fines-per-interval-stats.component';
import { TeamDashboardOpenFinesStatsComponent } from './stats-items/team-dashboard-open-fines-stats/team-dashboard-open-fines-stats.component';
import { TeamDashboardOpenFinesCountStatsComponent } from './stats-items/team-dashboard-open-fines-count-stats/team-dashboard-open-fines-count-stats.component';
import { TeamDashboardMostFinedPersonStatsComponent } from './stats-items/team-dashboard-most-fined-person-stats/team-dashboard-most-fined-person-stats.component';
import { TeamDashboardPayedFineStatsComponent } from './stats-items/team-dashboard-payed-fine-stats/team-dashboard-payed-fine-stats.component';

export interface UserDashboardFinesStats {
    type: 'user-dashboard-fines-stats';
    total:  SummedFineValue;
    notPayed: SummedFineValue;
    payed: SummedFineValue;
};

export type UserDashboardOpenFinesPerTeamStats = {
    type: 'user-dashboard-open-fines-per-team-stats';
    teams: Array<{
        teamName: string;
        openFines: SummedFineValue;
    }>;
}

export interface UserDashboardFinesPerIntervalStats {
    type: 'user-dashboard-fines-per-interval-stats';
    thisWeek: {
        totalValue: SummedFineValue;
        payedPercentage: number | null;
    };
    thisMonth: {
        totalValue: SummedFineValue;
        payedPercentage: number | null;
    };
    thisYear: {
        totalValue: SummedFineValue;
        payedPercentage: number | null;
    };
};

export interface TeamDashboardOpenFinesStats {
    type: 'team-dashboard-open-fines-stats';
    value: SummedFineValue;
};

export interface TeamDashboardOpenFinesCountStats {
    type: 'team-dashboard-open-fines-count-stats';
    count: number;
};

export interface TeamDashboardMostFinedPersonStats {
    type: 'team-dashboard-most-fined-person-stats';
    personProperties: PersonProperties;
    totalValue: SummedFineValue;
};

export interface TeamDashboardPayedFineStats {
    type: 'team-dashboard-payed-fine-stats';
    value: SummedFineValue;
};

export type DashboardStats =
    | UserDashboardFinesStats
    | UserDashboardOpenFinesPerTeamStats
    | UserDashboardFinesPerIntervalStats
    | TeamDashboardOpenFinesStats
    | TeamDashboardOpenFinesCountStats
    | TeamDashboardMostFinedPersonStats
    | TeamDashboardPayedFineStats;

@Component({
    selector: 'app-dashboard-stats',
    imports: [
        UserDashboardFinesStatsComponent,
        UserDashboardOpenFinesPerTeamStatsComponent,
        UserDashboardFinesPerIntervalStatsComponent,
        TeamDashboardOpenFinesStatsComponent,
        TeamDashboardOpenFinesCountStatsComponent,
        TeamDashboardMostFinedPersonStatsComponent,
        TeamDashboardPayedFineStatsComponent
    ],
    templateUrl: './dashboard-stats.component.html',
    styleUrl: './dashboard-stats.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class DashboardStatsComponent {

    public type = input.required<'user' | 'team'>();
}
