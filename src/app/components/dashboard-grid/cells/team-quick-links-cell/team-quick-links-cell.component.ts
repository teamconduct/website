import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-team-quick-links-cell',
    standalone: true,
    templateUrl: './team-quick-links-cell.component.html',
    styleUrl: './team-quick-links-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamQuickLinksCellComponent {
}
