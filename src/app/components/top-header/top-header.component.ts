import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBell as faSolidBell, faFutbol, faUser } from '@fortawesome/free-solid-svg-icons';
import { faBell as faRegularBell } from '@fortawesome/free-regular-svg-icons';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { DataManagerService } from '../../services/data-manager/data-manager.service';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { AppStateManagerService } from '../../services/app-state-manager/app-state-manager.service';
import { PersonNamePipe } from '../../pipes/person-name/person-name.pipe';

@Component({
    selector: 'app-top-header',
    imports: [FaIconComponent, ButtonModule, OverlayBadgeModule, AvatarModule, AsyncPipe],
    templateUrl: './top-header.component.html',
    styleUrl: './top-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopHeaderComponent {
    readonly faFutbol = faFutbol;
    readonly faSolidBell = faSolidBell;
    readonly faRegularBell = faRegularBell;
    readonly faUser = faUser;

    readonly colors = {
        primary: '#1a365d',
        textGray: '#4b5563',
        textDark: '#374151',
        white: 'white',
        hoverBg: '#f3f4f6',
    };

    readonly appStateManager = inject(AppStateManagerService);

    readonly dataManager = inject(DataManagerService);

    readonly unreadNotificationsCount$ = this.dataManager.notifications$.pipe(
        map(notifications => notifications?.values.filter(notification => !notification.isRead).length ?? 0)
    );

    readonly userName$ = this.appStateManager.user$.map(user => new PersonNamePipe().transform(user));

    readonly profilePictureUrl$ = this.appStateManager.user$.map(user => user.properties.profilePictureUrl);

    onNotificationClick(): void {
        console.log('Notifications clicked');
        // TODO: Implement notification logic
    }

    onProfileClick(): void {
        console.log('Profile clicked');
        // TODO: Implement profile logic
    }
}
