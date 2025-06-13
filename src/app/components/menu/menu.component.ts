import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, input, OnDestroy, viewChild } from '@angular/core';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { Router } from '@angular/router';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { removeNullValues } from '../../utils/removeNullValues';
import { routeNames } from '../../app.routes';
import { MenuItem } from 'primeng/api';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { MenuModule } from 'primeng/menu';
import { Toolbar, ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-menu',
    imports: [AsyncPipe, MenuModule, ToolbarModule, ButtonModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements AfterViewInit, OnDestroy {

    public userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private router = inject(Router);

    public readonly onTeamSelected = input.required<(teamId: Team.Id) => Promise<void>>();

    public readonly toolbar = viewChild.required<Toolbar>('toolbar');

    public readonly spacer = viewChild.required<ElementRef>('spacer');

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
            canAddFine ? {
                label: $localize `:Label for the fines menu item:Manage Fines`,
                items: [
                    {
                        label: 'Add multiple fines',
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
                            this.userManager.reset();
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

    public ngAfterViewInit() {
        setTimeout(() => this.adjustSpacerHeight());
        window.addEventListener('resize', () => this.adjustSpacerHeight());
    }

    private adjustSpacerHeight() {
        const toolbarHeight = this.toolbar().el.nativeElement.offsetHeight;
        this.spacer().nativeElement.style.height = `${toolbarHeight}px`;
    }

    public ngOnDestroy() {
        window.removeEventListener('resize', () => this.adjustSpacerHeight());
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
