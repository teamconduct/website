import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { UserManagerService } from '../../services/user-manager.service';
import { appRoutes } from '../../app.routes';
import { Tagged } from '../../types/Tagged';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { FineTemplate, PersonId, PersonWithFines } from '../../types';
import { AsyncPipe } from '../../pipes/async.pipe';
import { Observable, map } from 'rxjs';
import { TeamId } from '../../types/Team';
import { CardModule } from 'primeng/card';
import { PersonsListElementComponent } from '../../components/persons-list/persons-list-element/persons-list-element.component';
import { PersonsListComponent } from '../../components/persons-list/persons-list.component';
import { FineTemplatesListComponent } from '../../components/fine-templates-list/fine-templates-list.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [MenuModule, AsyncPipe, CardModule, PersonsListElementComponent, PersonsListComponent, FineTemplatesListComponent],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements OnInit {

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

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
                this.teamDataManager.startObserve(this.userManager.currentTeamId);
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
        if (this.userManager.currentTeamId !== null)
            this.teamDataManager.startObserve(this.userManager.currentTeamId);
    }

    public get currentTeamId(): TeamId | null {
        return this.userManager.currentTeamId;
    }

    public get signedInPersonId(): PersonId | null {
        if (this.userManager.signedInUser === null || this.userManager.currentTeamId === null)
            return null;
        if (!this.userManager.signedInUser.teams.has(this.userManager.currentTeamId))
            return null;
        return this.userManager.signedInUser.teams.get(this.userManager.currentTeamId).personId;
    }

    public get signedInPerson$(): Observable<PersonWithFines | 'not-found'> {
        return this.teamDataManager.persons$.pipe(map(persons => {
            const personId = this.signedInPersonId;
            if (personId === null || !persons.has(personId))
                return 'not-found';
            return persons.get(personId);
        }));
    }

    public get persons$(): Observable<PersonWithFines[]> {
        return this.teamDataManager.persons$.pipe(
            map(persons => {
                return persons.values.filter(person => person.id.guidString !== this.signedInPersonId?.guidString);
            })
        );
    }

    public get fineTemplates$(): Observable<FineTemplate[]> {
        return this.teamDataManager.fineTemplates$.pipe(map(fineTemplates => fineTemplates.values));
    }
}
