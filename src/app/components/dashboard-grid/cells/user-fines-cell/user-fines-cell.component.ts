import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { compactMap } from '@stevenkellner/typescript-common-functionality';
import { Fine } from '@stevenkellner/team-conduct-api';
import { UIChart } from 'primeng/chart';
import { AppStateManagerService } from '../../../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';

type PeriodKey = '3m' | '6m' | '12m' | '24m';

interface MonthBucket {
    key: string;
    label: string;
    start: Date;
}

interface UserFinesViewModel {
    totalFormatted: string;
    subtitle: string;
    deltaText: string;
    deltaDescription: string;
    deltaDirection: 'positive' | 'negative' | 'neutral';
    chartData: {
        labels: string[];
        datasets: Array<{
            data: number[];
            pointRadius: number;
            pointHoverRadius: number;
            borderColor: string;
            pointBackgroundColor: string;
            tension: number;
            fill: boolean;
        }>;
    };
    chartOptions: Record<string, unknown>;
}

@Component({
    selector: 'app-user-fines-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './user-fines-cell.component.html',
    styleUrl: './user-fines-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFinesCellComponent {

    // private readonly appStateManager = inject(AppStateManagerService);
//
    // private readonly dataManager = inject(DataManagerService);
//
    // private readonly selectedPeriod = signal<PeriodKey>('6m');
//
    // public onPeriodChange(event: Event) {
    //     const value = (event.target as HTMLSelectElement | null)?.value;
    //     if (value === '3m' || value === '6m' || value === '12m' || value === '24m')
    //         this.selectedPeriod.set(value);
    // }
//
    // private readonly userFinesViewModel$ = combineLatest([this.getUserFines$(), this.selectedPeriod$]).pipe(
    //     map(([fines, period]) => this.buildViewModel(fines, period))
    // );
//
    // public readonly userFinesViewModel = toSignal(this.userFinesViewModel$, {
    //     initialValue: this.buildViewModel([], '6m')
    // });
//
    // private getUserFines$(): Observable<Fine[]> {
    //     return this.appStateManager.user$.pipe(
    //         switchMap(user => {
    //             if (user === null)
    //                 return of([]);
//
    //             const teamFineStreams = user.teams.values.map(teamProperties => {
    //                 const team = this.dataManager.teams.getOptional(teamProperties.teamId);
    //                 if (team === null)
    //                     return of([] as Fine[]);
//
    //                 return combineLatest([team.persons$, team.fines$]).pipe(
    //                     map(([persons, fines]) => {
    //                         if (persons === null || fines === null)
    //                             return [];
//
    //                         const person = persons.getOptional(teamProperties.personId);
    //                         if (person === null)
    //                             return [];
//
    //                         return compactMap(person.fineIds, fineId => fines.getOptional(fineId));
    //                     })
    //                 );
    //             });
//
    //             if (teamFineStreams.length === 0)
    //                 return of([]);
//
    //             return combineLatest(teamFineStreams).pipe(
    //                 map(teamFines => teamFines.flat())
    //             );
    //         })
    //     );
    // }
//
    // private buildViewModel(fines: Fine[], period: PeriodKey): UserFinesViewModel {
    //     const months = this.getPeriodMonthCount(period);
    //     const periodLabel = this.getPeriodLabel(period);
    //     const currentBuckets = this.getMonthBuckets(months, 0);
    //     const previousBuckets = this.getMonthBuckets(months, months);
//
    //     const currentTotals = this.sumFinesByBuckets(fines, currentBuckets);
    //     const previousTotals = this.sumFinesByBuckets(fines, previousBuckets);
//
    //     const currentTotal = currentTotals.reduce((sum, value) => sum + value, 0);
    //     const previousTotal = previousTotals.reduce((sum, value) => sum + value, 0);
    //     const delta = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : null;
    //     const maxValue = Math.max(...currentTotals, 0);
    //     const yAxisMax = maxValue === 0 ? 100 : Math.ceil(maxValue / 50) * 50;
//
    //     return {
    //         totalFormatted: this.currencyFormatter.format(currentTotal),
    //         subtitle: `Total fines ${periodLabel.toLowerCase()}`,
    //         deltaText: delta === null ? '-' : `${delta >= 0 ? '+' : ''}${delta.toFixed(0)}%`,
    //         deltaDescription: delta === null ? 'no previous period data' : 'vs previous period',
    //         deltaDirection: delta === null ? 'neutral' : delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
    //         chartData: {
    //             labels: currentBuckets.map(bucket => bucket.label),
    //             datasets: [
    //                 {
    //                     data: currentTotals,
    //                     pointRadius: 3,
    //                     pointHoverRadius: 4,
    //                     borderColor: '#111827',
    //                     pointBackgroundColor: '#111827',
    //                     tension: 0.35,
    //                     fill: false
    //                 }
    //             ]
    //         },
    //         chartOptions: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             plugins: {
    //                 legend: {
    //                     display: false
    //                 },
    //                 tooltip: {
    //                     enabled: true,
    //                     callbacks: {
    //                         label: (context: { parsed: { y: number } }) => this.currencyFormatter.format(context.parsed.y)
    //                     }
    //                 }
    //             },
    //             scales: {
    //                 x: {
    //                     grid: {
    //                         display: false
    //                     },
    //                     ticks: {
    //                         color: '#94a3b8',
    //                         font: {
    //                             size: 10
    //                         }
    //                     }
    //                 },
    //                 y: {
    //                     min: 0,
    //                     max: yAxisMax,
    //                     ticks: {
    //                         color: '#94a3b8',
    //                         font: {
    //                             size: 10
    //                         },
    //                         callback: (value: number | string) => `$${value}`
    //                     },
    //                     grid: {
    //                         color: '#f1f5f9'
    //                     }
    //                 }
    //             }
    //         }
    //     };
    // }
//
    // private getPeriodMonthCount(period: PeriodKey): number {
    //     switch (period) {
    //     case '3m':
    //         return 3;
    //     case '6m':
    //         return 6;
    //     case '12m':
    //         return 12;
    //     case '24m':
    //         return 24;
    //     }
    // }
//
    // private getPeriodLabel(period: PeriodKey): string {
    //     switch (period) {
    //     case '3m':
    //         return 'Last 3 months';
    //     case '6m':
    //         return 'Last 6 months';
    //     case '12m':
    //         return 'Last 12 months';
    //     case '24m':
    //         return 'Last 2 years';
    //     }
    // }
//
    // private getMonthBuckets(monthCount: number, offsetInMonths: number): MonthBucket[] {
    //     const now = new Date();
    //     const buckets: MonthBucket[] = [];
//
    //     for (let i = monthCount - 1; i >= 0; i--) {
    //         const monthStart = new Date(now.getFullYear(), now.getMonth() - i - offsetInMonths, 1);
    //         buckets.push({
    //             key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
    //             label: this.monthFormatter.format(monthStart),
    //             start: monthStart
    //         });
    //     }
//
    //     return buckets;
    // }
//
    // private sumFinesByBuckets(fines: Fine[], buckets: MonthBucket[]): number[] {
    //     const sums = new Map<string, number>(buckets.map(bucket => [bucket.key, 0]));
//
    //     fines.forEach(fine => {
    //         const amount = fine.amount instanceof Fine.Amount.Money ? fine.amount.amount.completeValue : null;
    //         if (amount === null)
    //             return;
//
    //         const date = fine.date.toDate;
    //         const key = `${date.getFullYear()}-${date.getMonth()}`;
    //         if (!sums.has(key))
    //             return;
//
    //         sums.set(key, (sums.get(key) ?? 0) + amount);
    //     });
//
    //     return buckets.map(bucket => sums.get(bucket.key) ?? 0);
    // }
}
