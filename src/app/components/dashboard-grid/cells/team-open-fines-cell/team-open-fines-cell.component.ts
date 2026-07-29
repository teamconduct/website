import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'app-team-open-fines-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './team-open-fines-cell.component.html',
    styleUrl: './team-open-fines-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOpenFinesCellComponent {

    public readonly chartData = {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
        datasets: [
            {
                data: [780, 1120, 980, 1540, 1380, 1960, 2420],
                borderColor: '#16a34a',
                backgroundColor: 'rgba(34, 197, 94, 0.20)',
                pointRadius: 0,
                tension: 0.35,
                fill: true
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
                display: false,
                grid: {
                    display: false
                }
            },
            y: {
                display: false,
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
