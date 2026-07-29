import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-user-open-fines-per-team-cell',
    standalone: true,
    templateUrl: './user-open-fines-per-team-cell.component.html',
    styleUrl: './user-open-fines-per-team-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOpenFinesPerTeamCellComponent {
}
