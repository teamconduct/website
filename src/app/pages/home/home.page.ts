import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Person, Team } from '@stevenkellner/team-conduct-api';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../services/notification/notification.service';
import { ToastModule } from 'primeng/toast';
import { MenuComponent } from '../../components/menu/menu.component';
import { PopupDialogHandlerComponent } from '../../components/popup-dialog-handler/popup-dialog-handler.component';

@Component({
    selector: 'page-home',
    imports: [ToastModule, PopupDialogHandlerComponent, MenuComponent],
    providers: [MessageService, MenuComponent],
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
}
