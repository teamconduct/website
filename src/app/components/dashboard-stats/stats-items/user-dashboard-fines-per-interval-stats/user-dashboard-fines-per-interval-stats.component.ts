import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCalendarWeek } from '@fortawesome/free-solid-svg-icons';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { AppStateManagerService } from '../../../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { Observable, SummedFineValue } from '../../../../types';
import { PayedState, User } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

interface FinesPerInterval {
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
}

type IntervalType = 'thisWeek' | 'thisMonth' | 'thisYear';

@Component({
    selector: 'app-user-dashboard-fines-per-interval-stats',
    imports: [FineAmountPipe, DecimalPipe, AsyncPipe, FaIconComponent],
    templateUrl: './user-dashboard-fines-per-interval-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardFinesPerIntervalStatsComponent {

    public appStateManager = inject(AppStateManagerService);

    public dataManager = inject(DataManagerService);

    public readonly faCalendarWeek = faCalendarWeek;

    private currentInterval: IntervalType = 'thisWeek';

    public getFinesPerInterval$(user: User): Observable<FinesPerInterval> {
        return Observable.combineArray(user.teams.values.map(teamProperties => {
            const team = this.dataManager.teams.getOptional(teamProperties.teamId);
            if (team === null)
                return new Observable<{ totalWeek: SummedFineValue; payedWeek: SummedFineValue; totalMonth: SummedFineValue; payedMonth: SummedFineValue; totalYear: SummedFineValue; payedYear: SummedFineValue }>({
                    totalWeek: new SummedFineValue(),
                    payedWeek: new SummedFineValue(),
                    totalMonth: new SummedFineValue(),
                    payedMonth: new SummedFineValue(),
                    totalYear: new SummedFineValue(),
                    payedYear: new SummedFineValue(),
                });

            return Observable.combine(team.persons$, team.fines$, (persons, fines) => {
                const person = persons.getOptional(teamProperties.personId);
                if (person === null)
                    return {
                        totalWeek: new SummedFineValue(),
                        payedWeek: new SummedFineValue(),
                        totalMonth: new SummedFineValue(),
                        payedMonth: new SummedFineValue(),
                        totalYear: new SummedFineValue(),
                        payedYear: new SummedFineValue(),
                    };

                return person.fineIds.reduce((acc, fineId) => {
                    const fine = fines.getOptional(fineId);
                    if (fine === null)
                        return acc;

                    return {
                        totalWeek: fine.date >= UtcDate.now.advanced({ day: -7 }) ? acc.totalWeek.added(fine.amount) : acc.totalWeek,
                        payedWeek: fine.date >= UtcDate.now.advanced({ day: -7 }) && fine.payedState instanceof PayedState.Payed ? acc.payedWeek.added(fine.amount) : acc.payedWeek,
                        totalMonth: fine.date >= UtcDate.now.advanced({ month: -1 }) ? acc.totalMonth.added(fine.amount) : acc.totalMonth,
                        payedMonth: fine.date >= UtcDate.now.advanced({ month: -1 }) && fine.payedState instanceof PayedState.Payed ? acc.payedMonth.added(fine.amount) : acc.payedMonth,
                        totalYear: fine.date >= UtcDate.now.advanced({ year: -1 }) ? acc.totalYear.added(fine.amount) : acc.totalYear,
                        payedYear: fine.date >= UtcDate.now.advanced({ year: -1 }) && fine.payedState instanceof PayedState.Payed ? acc.payedYear.added(fine.amount) : acc.payedYear,
                    };
                }, {
                    totalWeek: new SummedFineValue(),
                    payedWeek: new SummedFineValue(),
                    totalMonth: new SummedFineValue(),
                    payedMonth: new SummedFineValue(),
                    totalYear: new SummedFineValue(),
                    payedYear: new SummedFineValue(),
                });
            });
        }), finesPerTeam => {
            const fines = finesPerTeam.reduce((acc, finesPerInterval) => ({
                totalWeek: acc.totalWeek.added(finesPerInterval.totalWeek),
                payedWeek: acc.payedWeek.added(finesPerInterval.payedWeek),
                totalMonth: acc.totalMonth.added(finesPerInterval.totalMonth),
                payedMonth: acc.payedMonth.added(finesPerInterval.payedMonth),
                totalYear: acc.totalYear.added(finesPerInterval.totalYear),
                payedYear: acc.payedYear.added(finesPerInterval.payedYear),
            }), {
                totalWeek: new SummedFineValue(),
                payedWeek: new SummedFineValue(),
                totalMonth: new SummedFineValue(),
                payedMonth: new SummedFineValue(),
                totalYear: new SummedFineValue(),
                payedYear: new SummedFineValue(),
            });

            return {
                thisWeek: {
                    totalValue: fines.totalWeek,
                    payedPercentage: fines.totalWeek.count > 0 ? fines.payedWeek.count / fines.totalWeek.count * 100 : null,
                },
                thisMonth: {
                    totalValue: fines.totalMonth,
                    payedPercentage: fines.totalMonth.count > 0 ? fines.payedMonth.count / fines.totalMonth.count * 100 : null,
                },
                thisYear: {
                    totalValue: fines.totalYear,
                    payedPercentage: fines.totalYear.count > 0 ? fines.payedYear.count / fines.totalYear.count * 100 : null,
                },
            };
        });
    }

    public get currentIntervalButtonName(): string {
        switch (this.currentInterval) {
        case 'thisWeek':
            return 'Week';
        case 'thisMonth':
            return 'Month';
        case 'thisYear':
            return 'Year';
        }
    }

    public get currentIntervalHeader(): string {
        switch (this.currentInterval) {
        case 'thisWeek':
            return 'Your Total Fines This Week';
        case 'thisMonth':
            return 'Your Total Fines This Month';
        case 'thisYear':
            return 'Your Total Fines This Year';
        }
    }

    public getCurrentIntervalStats(stats: FinesPerInterval): FinesPerInterval[IntervalType] {
        return stats[this.currentInterval];
    }

    public nextInterval() {
        switch (this.currentInterval) {
        case 'thisWeek':
            this.currentInterval = 'thisMonth';
            break;
        case 'thisMonth':
            this.currentInterval = 'thisYear';
            break;
        case 'thisYear':
            this.currentInterval = 'thisWeek';
            break;
        }
    }
}
