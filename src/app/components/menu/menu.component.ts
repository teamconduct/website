import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { Router } from '@angular/router';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { removeNullValues } from '../../utils/removeNullValues';
import { routeNames } from '../../app.routes';
import { MenuItem } from 'primeng/api';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
    selector: 'app-menu',
    imports: [AsyncPipe, MenuModule, ToolbarModule, ButtonModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent {

    public readonly onTeamSelected = input.required<(teamId: Team.Id) => Promise<void>>();

    public readonly currentPage = input.required<'profile' | 'persons' | 'fineTemplates'>();

    public readonly currentPageChange = output<'profile' | 'persons' | 'fineTemplates'>();

    private authenticationService = inject(AuthenticationService);

    public userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private router = inject(Router);

    private titleService = inject(Title);

    public toolbarExpanded: boolean = false;

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
            //             routerLink: `/${routeNames.createTeam}`
            //         }
            //     ]
            // },
            {
                label: $localize `:Label for the pages menu item:Pages`,
                items: [
                    {
                        label: $localize `:Label for the profile menu item:Profile`,
                        icon: 'pi pi-fw pi-user',
                        disabled: this.currentPage() === 'profile',
                        command: () => {
                            this.currentPageChange.emit('profile');
                            this.titleService.setTitle($localize `:Title for the profile page:Profile`);
                            this.toolbarExpanded = false;
                        }
                    },
                    {
                        label: $localize `:Label for the persons menu item:Persons`,
                        icon: 'pi pi-fw pi-users',
                        disabled: this.currentPage() === 'persons',
                        command: () => {
                            this.currentPageChange.emit('persons');
                            this.titleService.setTitle($localize `:Title for the persons page:Persons`);
                            this.toolbarExpanded = false;
                        }
                    },
                    {
                        label: $localize `:Label for the fine templates menu item:Fine Templates`,
                        icon: 'pi pi-fw pi-file',
                        disabled: this.currentPage() === 'fineTemplates',
                        command: () => {
                            this.currentPageChange.emit('fineTemplates');
                            this.titleService.setTitle($localize `:Title for the fine templates page:Fine Templates`);
                            this.toolbarExpanded = false;
                        }
                    }
                ]
            },
            canAddFine ? {
                label: $localize `:Label for the fines menu item:Manage Fines`,
                items: [
                    {
                        label: $localize `:Label for the add multiple fines menu item:Add multiple fines`,
                        icon: 'pi pi-fw pi-plus',
                        command: () => this.popupDialogHandler.activate({
                            type: 'fineAddEdit',
                            personId: null,
                            fine: null
                        })
                    }
                ]
            } : null,
            {
                label: 'Settings',
                items: removeNullValues([
                    canManageTeam ? {
                        label: $localize `:Label for the edit paypal.me link menu item:Edit paypal.me`,
                        icon: 'pi pi-fw pi-pencil',
                        command: () => this.popupDialogHandler.activate({
                            type: 'paypalMeAddEdit'
                        })
                    } : null,
                    {
                        label: $localize `:Label for the sign out menu item:Log Out`,
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => {
                            this.teamDataManager.reset();
                            this.userManager.setUser(null);
                            void this.authenticationService.signOut();
                            void this.router.navigate([`/${routeNames.signIn}`]);
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
            command: () => void this.onTeamSelected()(teamId)
        })).values;
    }

    public toggleToolbar(value: boolean | null = null) {
        this.toolbarExpanded = value ?? !this.toolbarExpanded;
    }

    public getCurrentTeamName(user: User | null, selectedTeamId: Team.Id | null): string | null {
        if (user == null || selectedTeamId == null)
            return null;
        const team = user.teams.getOptional(selectedTeamId);
        if (team == null)
            return null;
        return team.name;
    }
}
