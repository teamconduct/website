import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserManagerService } from '../../services/user-manager.service';
import { appRoutes } from '../../app.routes';
import { Tagged } from '../../types/Tagged';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { PersonId, PersonWithFines, User } from '../../types';
import { AsyncPipe } from '../../pipes/async.pipe';
import { CardModule } from 'primeng/card';
import { PersonsListElementComponent } from '../../components/persons-list/persons-list-element/persons-list-element.component';
import { PersonsListComponent } from '../../components/persons-list/persons-list.component';
import { FineTemplatesListComponent } from '../../components/fine-templates-list/fine-templates-list.component';
import { combine, Observable } from '../../types/Observable';
import { NotificationService } from '../../services/notification.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { FineDetailAddEditComponent } from '../../components/fines-list/fine-detail-add-edit/fine-detail-add-edit.component';
import { TeamId } from '../../types/Team';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [MenuModule, AsyncPipe, CardModule, PersonsListElementComponent, PersonsListComponent, FineTemplatesListComponent, ToastModule, ButtonModule, FineDetailAddEditComponent],
    providers: [MessageService],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {

    public userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private notificationService = inject(NotificationService);

    private messageService = inject(MessageService);

    public visibleState: 'persons' | 'fineTemplates' = 'persons';

    public addMultipleFinesDialogVisible = false;

    public teamMenu(user: User, selectedTeamId: TeamId | null, canAddFine: boolean): MenuItem[] {
        const teamsItems = user.teams.map<MenuItem>((team, teamId) => ({
            label: team.name,
            icon: 'pi pi-fw pi-users',
            disabled: teamId === selectedTeamId?.guidString,
            command: () => {
                void this.onTeamSelected(Tagged.guid(teamId, 'team'));
            }
        })).values;
        return [
            {
                label: 'Your Teams',
                items: teamsItems
            },
            {
                label: 'Manage Your Teams',
                items: [
                    {
                        label: 'Add Team',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: `/${appRoutes.signUp}`
                    }
                ]
            },
            ...(canAddFine ? [{
                label: 'Fines',
                items: [
                    {
                        label: 'Add multiple fines',
                        icon: 'pi pi-fw pi-plus',
                        command: () => this.addMultipleFinesDialogVisible = true
                    }
                ]
            }] : [])
        ];
    }

    public ngOnInit() {
        this.userManager.getAllCookies();
        const teamId = this.userManager.selectedTeamId$.value;
        if (teamId !== null)
            void this.onTeamSelected(teamId);
    }

    private async onTeamSelected(teamId: TeamId) {
        this.userManager.setTeamId(teamId);
        this.teamDataManager.startObserve(teamId);
        this.userManager.currentPersonId$.subscribe(currentPersonId => {
            if (currentPersonId === null)
                return;
            void this.registerSubscribeNotifications(teamId, currentPersonId);
        });
    }

    private async registerSubscribeNotifications(teamId: TeamId, personId: PersonId) {
        const messageSubject = await this.notificationService.register(teamId, personId);
        if (messageSubject !== null) {
            messageSubject.subscribe(message => {
                this.messageService.add({
                    severity: 'info',
                    summary: message.title,
                    detail: message.body,
                    life: 7500
                });
            });
        }
        await this.notificationService.subscribe(teamId, personId, 'new-fine', 'fine-state-change', 'fine-reminder');
    }

    public get signedInPerson$(): Observable<PersonWithFines | null> {
        return combine(this.userManager.currentPersonId$, this.teamDataManager.persons$, (currentPersonId, persons) => {
            if (currentPersonId === null || !persons.has(currentPersonId))
                return null;
            return persons.get(currentPersonId);
        });
    }

    public get visibleStateIndex(): number {
        switch (this.visibleState) {
        case 'persons':
            return 0;
        case 'fineTemplates':
            return 1;
        }
    }
}
