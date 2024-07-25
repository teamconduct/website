import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserManagerService } from '../../services/user-manager.service';
import { appRoutes } from '../../app.routes';
import { Tagged } from '../../types/Tagged';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { PersonId, PersonWithFines } from '../../types';
import { AsyncPipe } from '../../pipes/async.pipe';
import { CardModule } from 'primeng/card';
import { PersonsListElementComponent } from '../../components/persons-list/persons-list-element/persons-list-element.component';
import { PersonsListComponent } from '../../components/persons-list/persons-list.component';
import { FineTemplatesListComponent } from '../../components/fine-templates-list/fine-templates-list.component';
import { Observable } from '../../types/Observable';
import { NotificationService } from '../../services/notification.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [MenuModule, AsyncPipe, CardModule, PersonsListElementComponent, PersonsListComponent, FineTemplatesListComponent, ToastModule, ButtonModule],
    providers: [MessageService],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private notificationService = inject(NotificationService);

    private messageService = inject(MessageService);

    public visibleState: 'persons' | 'fineTemplates' = 'persons';

    public get teamMenu(): MenuItem[] {
        if (this.userManager.signedInUser === null)
            return [];
        const currentTeamId = this.userManager.currentTeamId;
        const teamsItems = this.userManager.signedInUser.teams.map<MenuItem>((team, teamId) => ({
            label: team.name,
            icon: 'pi pi-fw pi-users',
            disabled: teamId === currentTeamId?.guidString,
            command: () => {
                this.userManager.currentTeamId = Tagged.guid(teamId, 'team');
                void this.onTeamSelected();
            }
        })).values;
        return [
            {
                label: 'Your Teams',
                items: teamsItems
            },
            {
                label: 'Manage Teams',
                items: [
                    {
                        label: 'Add Team',
                        icon: 'pi pi-fw pi-plus',
                        routerLink: `/${appRoutes.signUp}`
                    }
                ]
            }
        ];
    }

    public ngOnInit() {
        void this.onTeamSelected();
    }

    private async onTeamSelected() {
        if (this.signedInPersonId === null ||this.userManager.currentTeamId == null)
            return;
        this.teamDataManager.startObserve(this.userManager.currentTeamId);
        const messageSubject = await this.notificationService.register();
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
        await this.notificationService.subscribe('new-fine', 'fine-state-change', 'fine-reminder');
    }

    public get signedInPersonId(): PersonId | null {
        if (this.userManager.signedInUser === null || this.userManager.currentTeamId === null)
            return null;
        if (!this.userManager.signedInUser.teams.has(this.userManager.currentTeamId))
            return null;
        return this.userManager.signedInUser.teams.get(this.userManager.currentTeamId).personId;
    }

    public get signedInPerson$(): Observable<PersonWithFines | null> {
        return this.teamDataManager.persons$.map(persons => {
            const personId = this.signedInPersonId;
            if (personId === null || !persons.has(personId))
                return null;
            return persons.get(personId);
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
