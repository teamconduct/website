import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'app-team-payed-fines-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './team-payed-fines-cell.component.html',
    styleUrl: './team-payed-fines-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPayedFinesCellComponent {

    public readonly chartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                label: 'Collected',
                data: [640, 780, 860, 980],
                backgroundColor: '#111827',
                borderRadius: 8,
                barPercentage: 0.72,
                categoryPercentage: 0.64
            },
            {
                label: 'Open',
                data: [520, 600, 440, 660],
                backgroundColor: '#cbd5e1',
                borderRadius: 8,
                barPercentage: 0.72,
                categoryPercentage: 0.64
            }
        ]
    };

    public readonly chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                ticks: {
                    display: false
                },
                grid: {
                    display: false
                },
                border: {
                    display: false
                }
            }
        }
    };
}
