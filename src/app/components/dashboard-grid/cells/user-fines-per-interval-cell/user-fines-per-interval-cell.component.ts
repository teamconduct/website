import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'app-user-fines-per-interval-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './user-fines-per-interval-cell.component.html',
    styleUrl: './user-fines-per-interval-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFinesPerIntervalCellComponent {

    public readonly chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                type: 'bar',
                label: 'Paid',
                data: [90, 145, 120, 180, 110, 215],
                backgroundColor: '#dbeafe',
                borderRadius: 8,
                barPercentage: 0.72,
                categoryPercentage: 0.68,
                order: 2
            },
            {
                type: 'line',
                label: 'Incurred',
                data: [120, 176, 152, 240, 168, 280],
                borderColor: '#111827',
                backgroundColor: '#111827',
                pointRadius: 3,
                pointHoverRadius: 3,
                tension: 0.35,
                fill: false,
                order: 1
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
                    color: '#94a3b8',
                    font: {
                        size: 10
                    },
                    callback: (value: number | string) => `$${value}`
                },
                grid: {
                    color: '#f1f5f9'
                }
            }
        }
    };
}
