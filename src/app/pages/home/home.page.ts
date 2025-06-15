import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Person, Team } from '@stevenkellner/team-conduct-api';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../services/notification/notification.service';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MenuComponent } from '../../components/menu/menu.component';
import { PopupDialogHandlerComponent } from '../../components/popup-dialog-handler/popup-dialog-handler.component';
import { Observable } from '../../types';
import { PersonWithFines } from '../../types/PersonWithFines';
import { PersonDetailComponent } from '../../components/person/person-detail/person-detail.component';
import { FineTemplateListComponent } from '../../components/fine-template/fine-template-list/fine-template-list.component';
import { PersonListAndDetailComponent } from '../../components/person/person-list-and-detail/person-list-and-detail.component';
import { Title } from '@angular/platform-browser';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { routeNames } from '../../app.routes';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';

@Component({
    selector: 'page-home',
    imports: [AsyncPipe, ToastModule, PopupDialogHandlerComponent, MenuComponent, CardModule, PersonDetailComponent, PersonListAndDetailComponent, FineTemplateListComponent],
    providers: [MessageService, MenuComponent],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {

    private firebaseAuth = inject(Auth);

    public userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private notificationService = inject(NotificationService);

    private messageService = inject(MessageService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private router = inject(Router);

    public currentPage: 'profile' | 'persons' | 'fineTemplates' = 'profile';

    private titleService = inject(Title);

    public ngOnInit() {
        this.titleService.setTitle($localize `:Title for the home page:Home`);
        this.firebaseAuth.onAuthStateChanged(async user => {
            if (user === null) {
                this.userManager.setUser(null);
                this.teamDataManager.reset();
                this.userManager.setUser(null);
                void this.router.navigate([`/${routeNames.signIn}`]);
            } else {
                const user = await this.firebaseFunctions.functions.user.login.execute(null);
                this.userManager.setUser(user);
                const teamId = this.userManager.selectedTeamId$.value;
                if (teamId !== null)
                    this.onTeamSelected(teamId);
            }
        });
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
        return Observable.combine(this.userManager.currentPersonId$, this.teamDataManager.persons$, (currentPersonId, persons) => {
            if (currentPersonId === null || !persons.has(currentPersonId))
                return null;
            return persons.get(currentPersonId);
        });
    }
}
