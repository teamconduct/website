import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UIChart } from 'primeng/chart';

@Component({
    selector: 'app-team-open-fines-count-cell',
    standalone: true,
    imports: [UIChart],
    templateUrl: './team-open-fines-count-cell.component.html',
    styleUrl: './team-open-fines-count-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamOpenFinesCountCellComponent {

    public readonly chartData = {
        labels: ['Late', 'Cards', 'Other'],
        datasets: [
            {
                data: [14, 11, 13],
                backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'],
                borderWidth: 0,
                hoverOffset: 2,
                cutout: '72%'
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
        }
    };
}
