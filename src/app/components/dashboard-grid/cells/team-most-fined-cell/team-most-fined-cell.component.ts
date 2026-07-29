import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-team-most-fined-cell',
    standalone: true,
    templateUrl: './team-most-fined-cell.component.html',
    styleUrl: './team-most-fined-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMostFinedCellComponent {
}
