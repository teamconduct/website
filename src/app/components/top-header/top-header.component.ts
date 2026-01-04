import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBell as faSolidBell, faFutbol } from '@fortawesome/free-solid-svg-icons';
import { faBell as faRegularBell } from '@fortawesome/free-regular-svg-icons';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';

@Component({
    selector: 'app-top-header',
    imports: [FaIconComponent, ButtonModule, OverlayBadgeModule, AvatarModule],
    templateUrl: './top-header.component.html',
    styleUrl: './top-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopHeaderComponent {
    readonly faFutbol = faFutbol;
    readonly faSolidBell = faSolidBell;
    readonly faRegularBell = faRegularBell;

    readonly colors = {
        primary: '#1a365d',
        textGray: '#4b5563',
        textDark: '#374151',
        white: 'white',
        hoverBg: '#f3f4f6',
    };

    readonly notificationCount = signal(3); // TODO: Replace with real data
    readonly userName = signal('Coach Martinez'); // TODO: Replace with real data
    readonly userAvatar = signal('https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'); // TODO: Replace with real data

    onNotificationClick(): void {
        console.log('Notifications clicked');
        // TODO: Implement notification logic
    }

    onProfileClick(): void {
        console.log('Profile clicked');
        // TODO: Implement profile logic
    }
}
