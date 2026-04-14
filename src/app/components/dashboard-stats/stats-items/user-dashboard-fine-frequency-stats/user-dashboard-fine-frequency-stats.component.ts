import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { AppStateManagerService } from '../../../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { Observable } from '../../../../types';
import { User } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

interface FineFrequencyStats {
    recentCount: number;
    previousCount: number;
}

@Component({
    selector: 'app-user-dashboard-fine-frequency-stats',
    imports: [AsyncPipe, DecimalPipe, FaIconComponent],
    templateUrl: './user-dashboard-fine-frequency-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardFineFrequencyStatsComponent {

    public readonly appStateManager = inject(AppStateManagerService);

    public readonly dataManager = inject(DataManagerService);

    public readonly faChartLine = faChartLine;

    public getFineFrequencyStats$(user: User): Observable<FineFrequencyStats> {
        return Observable.combineArray(user.teams.values.map(teamProperties => {
            const team = this.dataManager.teams.getOptional(teamProperties.teamId);
            if (team === null)
                return new Observable<FineFrequencyStats>({ recentCount: 0, previousCount: 0 });

            return Observable.combine(team.persons$, team.fines$, (persons, fines) => {
                const person = persons.getOptional(teamProperties.personId);
                if (person === null)
                    return { recentCount: 0, previousCount: 0 };

                const fourWeeksAgo = UtcDate.now.advanced({ day: -28 });
                const eightWeeksAgo = UtcDate.now.advanced({ day: -56 });

                return person.fineIds.reduce((acc, fineId) => {
                    const fine = fines.getOptional(fineId);
                    if (fine === null)
                        return acc;

                    if (fine.date >= fourWeeksAgo)
                        return { ...acc, recentCount: acc.recentCount + 1 };
                    if (fine.date >= eightWeeksAgo)
                        return { ...acc, previousCount: acc.previousCount + 1 };
                    return acc;
                }, { recentCount: 0, previousCount: 0 });
            });
        }), statsPerTeam => statsPerTeam.reduce((acc, stats) => ({
            recentCount: acc.recentCount + stats.recentCount,
            previousCount: acc.previousCount + stats.previousCount,
        }), { recentCount: 0, previousCount: 0 }));
    }

    public getRecentAveragePerWeek(stats: FineFrequencyStats): number {
        return stats.recentCount / 4;
    }

    public getTrendPercentage(stats: FineFrequencyStats): number | null {
        if (stats.previousCount === 0)
            return null;
        return ((stats.recentCount - stats.previousCount) / stats.previousCount) * 100;
    }
}
