import { inject, Injectable } from '@angular/core';
import { TeamDataManagerService } from '../team-data-manager/team-data-manager.service';
import { Person, Team, User, UserRole } from '@stevenkellner/team-conduct-api';
import { Observable } from '../../types';
import { PersonWithFines } from '../../types/PersonWithFines';

@Injectable({
    providedIn: 'root'
})
export class UserManagerService {

    private teamDataManager = inject(TeamDataManagerService);

    public user$ = new Observable<User>();

    public selectedTeamId$ = new Observable<Team.Id>();

    public setUser(user: User | null) {
        this.user$.next(user);
        if (user !== null && !user.teams.isEmpty)
            this.setTeamId(user.teams.keys[0]);
    }

    public setTeamId(teamId: Team.Id) {
        this.selectedTeamId$.next(teamId);
    }

    public get currentTeamName$(): Observable<string | null> {
        return  Observable.combine(this.user$, this.selectedTeamId$, (user, teamId) => {
            if (!user.teams.has(teamId))
                return null;
            return user.teams.get(teamId).name;
        });
    }

    public get currentPersonId$(): Observable<Person.Id | null> {
        return Observable.combine(this.user$, this.selectedTeamId$, (user, teamId) => {
            if (!user.teams.has(teamId))
                return null;
            return user.teams.get(teamId).personId;
        });
    }

    public get currentPerson$(): Observable<PersonWithFines | null> {
        return Observable.combine(this.currentPersonId$, this.teamDataManager.persons$, (personId, persons) => {
            if (personId === null)
                return null;
            return persons.get(personId);
        });
    }

    public hasRole(...roles: UserRole[]): Observable<boolean> {
        return this.currentPerson$.map(person => {
            if (person === null || person.signInProperties === null)
                return false;
            const personRoles = person.signInProperties.roles;
            return roles.every(role => personRoles.includes(role));
        });
    }
}
