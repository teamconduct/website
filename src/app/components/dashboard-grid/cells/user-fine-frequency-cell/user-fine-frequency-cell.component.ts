import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'app-user-fine-frequency-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './user-fine-frequency-cell.component.html',
    styleUrl: './user-fine-frequency-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFineFrequencyCellComponent {

    public readonly chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [35, 58, 42, 72, 49, 85, 66],
                backgroundColor: '#0891b2',
                borderRadius: 6,
                barPercentage: 0.75,
                categoryPercentage: 0.72
            }
        ]
    };

    public readonly chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: { parsed: { y: number } }) => `${context.parsed.y}%`
                }
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
                min: 0,
                max: 100,
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
