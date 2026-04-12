import { Injectable } from '@angular/core';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { Observable } from '../../types';

@Injectable({
    providedIn: 'root'
})
export class AppStateManagerService {

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
}
