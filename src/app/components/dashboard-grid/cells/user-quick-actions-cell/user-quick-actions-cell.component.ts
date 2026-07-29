import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-user-quick-actions-cell',
    standalone: true,
    templateUrl: './user-quick-actions-cell.component.html',
    styleUrl: './user-quick-actions-cell.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserQuickActionsCellComponent {
}
