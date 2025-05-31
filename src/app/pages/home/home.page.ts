import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserManagerService } from '../../services/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { AsyncPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PersonsListElementComponent } from '../../components/persons-list/persons-list-element/persons-list-element.component';
import { PersonsListComponent } from '../../components/persons-list/persons-list.component';
import { FineTemplatesListComponent } from '../../components/fine-templates-list/fine-templates-list.component';
import { combine, Observable } from '../../types/Observable';
import { NotificationService } from '../../services/notification.service';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { Person, Team } from '@stevenkellner/team-conduct-api';
import { PersonWithFines } from '../../types/PersonWithFines';
import { TeamMenuComponent } from '../../components/team-menu/team-menu.component';
import { PopupDialogHandlerComponent } from '../../components/popup-dialog-handler/popup-dialog-handler.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [PopupDialogHandlerComponent, MenuModule, AsyncPipe, CardModule, PersonsListElementComponent, PersonsListComponent, FineTemplatesListComponent, ToastModule, ButtonModule, TeamMenuComponent],
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

    public ngOnInit() {
        this.userManager.getAllCookies();
        const teamId = this.userManager.selectedTeamId$.value;
        if (teamId !== null)
            void this.onTeamSelected(teamId);
    }

    public async onTeamSelected(teamId: Team.Id) {
        this.userManager.setTeamId(teamId);
        this.teamDataManager.startObserve(teamId);
        this.userManager.currentPersonId$.subscribe(currentPersonId => {
            if (currentPersonId === null)
                return;
            void this.registerSubscribeNotifications(teamId, currentPersonId);
        });
    }

    private async registerSubscribeNotifications(teamId: Team.Id, personId: Person.Id) {
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
