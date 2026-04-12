import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
    faChartLine,
    faFileInvoiceDollar,
    faGear,
    faHouse,
    faLayerGroup,
    faRightLeft,
    faSliders,
    faUserGroup,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import { routeNames } from '../../app.routes';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppStateManagerService } from '../../services/app-state-manager/app-state-manager.service';
import { User } from '@stevenkellner/team-conduct-api';
import { DataManagerService } from '../../services/data-manager/data-manager.service';

interface NavItem {
    route: string | null;
    icon: IconDefinition;
    label: string;
}

@Component({
    selector: 'app-left-sidebar',
    imports: [AsyncPipe, FaIconComponent, RouterLink, RouterLinkActive],
    templateUrl: './left-sidebar.component.html',
    styleUrl: './left-sidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftSidebarComponent {

    readonly appStateManager = inject(AppStateManagerService);

    readonly dataManager = inject(DataManagerService);

    readonly user$ = this.appStateManager.user$;

    readonly selectedTeamId$ = this.appStateManager.selectedTeamId$;

    readonly isTeamSwitcherOpen = signal(false);

    readonly faRightLeft = faRightLeft;

    readonly faUsers = faUsers;

    readonly labels = {
        global: $localize`:Left sidebar global section title:Global`,
        teamContext: $localize`:Left sidebar team context title:Team Context`,
        noTeamSelected: $localize`:Left sidebar no team selected title:No Team Selected`,
        noTeamSelectedDescription: $localize`:Left sidebar no team selected card description:Select a team to view specific details.`,
        switchTeam: $localize`:Left sidebar team switcher label:Switch Team`,
        comingSoon: $localize`:Left sidebar coming soon badge:Soon`,
        selectedTeamFallback: $localize`:Left sidebar selected team fallback title:Selected Team`
    };

    readonly globalNavItems: NavItem[] = [
        { route: `/${routeNames.userDashboard}`, icon: faHouse, label: $localize`:Left sidebar user dashboard nav item:User Dashboard` },
        { route: null, icon: faUsers, label: $localize`:Left sidebar all teams nav item:All Teams` },
        { route: null, icon: faGear, label: $localize`:Left sidebar user settings nav item:User Settings` }
    ];

    readonly teamNavItems: NavItem[] = [
        { route: null, icon: faChartLine, label: $localize`:Left sidebar team dashboard nav item:Team Dashboard` },
        { route: null, icon: faUserGroup, label: $localize`:Left sidebar players nav item:Players` },
        { route: null, icon: faFileInvoiceDollar, label: $localize`:Left sidebar team fines nav item:Team Fines` },
        { route: null, icon: faLayerGroup, label: $localize`:Left sidebar templates nav item:Templates` },
        { route: null, icon: faSliders, label: $localize`:Left sidebar team settings nav item:Team Settings` }
    ];

    public selectTeam(teamId: User.TeamProperties['teamId']) {
        this.appStateManager.setTeamId(teamId);
        this.isTeamSwitcherOpen.set(false);
    }

    public toggleTeamSwitcher() {
        this.isTeamSwitcherOpen.update(value => !value);
    }

    public getSelectedTeamName(user: User | null, selectedTeamId: User.TeamProperties['teamId'] | null): string {
        if (user === null || selectedTeamId === null)
            return $localize`:Left sidebar no team selected title:No Team Selected`;
        const selectedTeamData = this.dataManager.teams.getOptional(selectedTeamId);
        const liveTeam = selectedTeamData?.team$.value;
        if (liveTeam !== null && liveTeam !== undefined)
            return liveTeam.name;
        return user.teams.getOptional(selectedTeamId)?.teamName ?? this.labels.selectedTeamFallback;
    }

    public getSelectedTeamLogoUrl(selectedTeamId: User.TeamProperties['teamId'] | null): string | null {
        if (selectedTeamId === null)
            return null;
        return this.dataManager.teams.getOptional(selectedTeamId)?.team$.value?.logoUrl ?? null;
    }

    public isTeamSelected(teamId: User.TeamProperties['teamId'], selectedTeamId: User.TeamProperties['teamId'] | null): boolean {
        if (selectedTeamId === null)
            return false;
        return teamId.guidString === selectedTeamId.guidString;
    }

    public getTeamDisplayName(teamProperties: User.TeamProperties): string {
        const liveTeamName = this.dataManager.teams.getOptional(teamProperties.teamId)?.team$.value?.name;
        return liveTeamName ?? teamProperties.teamName;
    }

}
