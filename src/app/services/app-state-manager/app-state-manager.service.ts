import { Injectable } from '@angular/core';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { Observable, PersistedAppState, PersistentData, persistentDataKeys } from '../../types';

@Injectable({
    providedIn: 'root'
})
export class AppStateManagerService {

    private readonly persistentData = new PersistentData<PersistedAppState>(persistentDataKeys.appState);

    public user$ = new Observable<User>();

    public selectedTeamId$ = new Observable<Team.Id>();

    public constructor() {
        this.hydrate();
    }

    public setUser(user: User | null) {
        this.user$.next(user);

        if (user === null) {
            this.selectedTeamId$.next(null);
            this.persist();
            return;
        }

        const selectedTeamId = this.selectedTeamId$.value;
        const hasSelectedTeam = selectedTeamId !== null && user.teams.getOptional(selectedTeamId) !== null;
        if (!hasSelectedTeam && user.teams.values.length === 1)
            this.selectedTeamId$.next(user.teams.keys[0]);

        this.persist();
    }

    public setTeamId(teamId: Team.Id | null) {
        this.selectedTeamId$.next(teamId);
        this.persist();
    }

    private hydrate() {
        const persistedState = this.persistentData.load();
        if (persistedState === null)
            return;

        if (persistedState.user !== null)
            this.user$.next(User.builder.build(persistedState.user));

        if (persistedState.selectedTeamId !== null)
            this.selectedTeamId$.next(Team.Id.builder.build(persistedState.selectedTeamId));
    }

    private persist() {
        const persistedState: PersistedAppState = {
            user: this.user$.value?.flatten ?? null,
            selectedTeamId: this.selectedTeamId$.value?.guidString ?? null
        };

        this.persistentData.save(persistedState);
    }
}
