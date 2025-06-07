import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TeamDataManagerService } from '../team-data-manager/team-data-manager.service';
import { Person, Team, User, UserRole } from '@stevenkellner/team-conduct-api';
import { Observable } from '../../types';
import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { PersonWithFines } from '../../types/PersonWithFines';

@Injectable({
    providedIn: 'root'
})
export class UserManagerService {

    private cookieService = inject(CookieService);

    private teamDataManager = inject(TeamDataManagerService);

    public user$ = new Observable<User>();

    public selectedTeamId$ = new Observable<Team.Id>();

    public setUser(user: User) {
        this.user$.next(user);
        this.setCookie('user', user);
    }

    public setTeamId(teamId: Team.Id) {
        this.selectedTeamId$.next(teamId);
        this.setCookie('teamId', teamId);
    }

    public getAllCookies() {
        const user = this.getCookie('user', User.builder);
        if (user !== null)
            this.user$.next(user);
        const teamId = this.getCookie('teamId', Team.Id.builder);
        if (teamId !== null)
            this.selectedTeamId$.next(teamId);
    }

    private setCookie(key: string, value: any) {
        const json = JSON.stringify(Flattable.flatten(value));
        this.cookieService.set(key, json);
    }

    private getCookie<T>(key: string, builder: ITypeBuilder<Flattable.Flatten<T>, T>): T | null {
        if (!this.cookieService.check(key))
            return null;
        const json = this.cookieService.get(key);
        return builder.build(JSON.parse(json));
    }

    private clearCookie(key: string) {
        this.cookieService.delete(key);
    }

    public reset() {
        this.clearCookie('user');
        this.clearCookie('teamId');
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
