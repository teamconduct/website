import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserManagerService } from '../../services/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { Router } from '@angular/router';
import { appRoutes } from '../../app.routes';
import { AsyncPipe } from '@angular/common';
import { removeNullValues } from '../../utils/removeNullValues';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler.service';

@Component({
    selector: 'app-team-menu',
    standalone: true,
    imports: [MenuModule, AsyncPipe],
    templateUrl: './team-menu.component.html',
    styleUrl: './team-menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamMenuComponent {

    public userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private router = inject(Router);

    @Input({ required: true }) public onTeamSelected!: (teamId: Team.Id) => Promise<void>;

    public getTeamMenu(user: User | null, selectedTeamId: Team.Id | null, canAddFine: boolean, canManageTeam: boolean): MenuItem[] {
        return removeNullValues([
            user != null ? {
                label: $localize `:Label for the teams menu item:Your Teams`,
                items: this.getUserTeamsMenuItems(user, selectedTeamId)
            } : null,
            // {
            //     label: $localize `:Label for the add team menu item:Manage Your Teams`,
            //     items: [
            //         {
            //             label: $localize `:Label for the add team menu item:Add a new team`,
            //             icon: 'pi pi-fw pi-plus',
            //             routerLink: `/${appRoutes.createTeam}`
            //         }
            //     ]
            // },
            canAddFine ? {
                label: $localize `:Label for the fines menu item:Manage Fines`,
                items: [
                    {
                        label: 'Add multiple fines',
                        icon: 'pi pi-fw pi-plus',
                        command: () => this.popupDialogHandler.activate('fineDetailAddEdit')
                    }
                ]
            } : null,
            {
                label: 'Settings',
                items: removeNullValues([
                    canManageTeam ? {
                        label: $localize `:Label for the edit paypal.me link menu item:Edit paypal.me`,
                        icon: 'pi pi-fw pi-pencil',
                        command: () => this.popupDialogHandler.activate('paypalMeAddEdit')
                    } : null,
                    {
                        label: $localize `:Label for the sign out menu item:Log Out`,
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => {
                            this.teamDataManager.reset();
                            this.userManager.reset();
                            void this.router.navigate([`/${appRoutes.signIn}`]);
                        }
                    }
                ])
            }
        ]);
    }

    private getUserTeamsMenuItems(user: User, selectedTeamId: Team.Id | null): MenuItem[] {
        return user.teams.map<MenuItem>((team, teamId) => ({
            label: team.name,
            icon: 'pi pi-fw pi-users',
            disabled: teamId.guidString === selectedTeamId?.guidString,
            command: () => void this.onTeamSelected(teamId)
        })).values;
    }
}
