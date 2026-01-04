import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faHome, faUsers, faCog, faChartLine, faUserFriends, faExclamationTriangle, faFutbol } from '@fortawesome/free-solid-svg-icons';

interface NavItem {
    route: string;
    icon: IconDefinition;
    label: string;
}

@Component({
    selector: 'app-left-sidebar',
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftSidebarComponent {

    // Current route - this should be updated based on your routing logic
    currentRoute = signal<string>('team-dashboard');

    // Current team name - this should be updated based on selected team
    currentTeamName = signal<string | null>('Thunder FC');

    // Icons
    faFutbol = faFutbol;

    // Top navigation items
    topNavItems: NavItem[] = [
        { route: 'dashboard', icon: faHome, label: 'User Dashboard' },
        { route: 'teams', icon: faUsers, label: 'Your Teams' },
        { route: 'settings', icon: faCog, label: 'Settings' },
    ];

    // Team navigation items
    teamNavItems: NavItem[] = [
        { route: 'team-dashboard', icon: faChartLine, label: 'Team Dashboard' },
        { route: 'players', icon: faUserFriends, label: 'Players' },
        { route: 'penalties', icon: faExclamationTriangle, label: 'Penalties List' },
        { route: 'team-settings', icon: faCog, label: 'Team Settings' },
    ];

    otherTeams: NavItem[] = [
        { route: 'team-eagles', icon: faFutbol, label: 'Eagles FC' },
        { route: 'team-sharks', icon: faFutbol, label: 'Sharks United' },
    ];

    // Color palette for the sidebar
    colors = {
        primary: '#1a365d',
        secondary: '#2d5a87',
        accent: '#3182ce',
        accentHover: '#2563eb',
        textPrimary: '#374151',
        white: '#ffffff',
        hoverBg: '#97e2ebff',
        teamNameText: '#0c4a6e',
        teamHeaderBg: 'transparent',
        teamHeaderBorder: '#3182ce',
        iconColor: '#3182ce',
        activeBg: '#dbeafe',
        activeText: '#1e40af',
        activeHoverBg: '#bfdbfe',
        activeBorder: '#3182ce',
        dividerColor: '#dbeafe',
    };
}
