import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { Observable, Observer, PersistentData, persistentDataKeys } from '../../types';
import { InAppNotification, Team, User } from '@stevenkellner/team-conduct-api';
import { Dictionary, Flattable, values } from '@stevenkellner/typescript-common-functionality';
import { collection, CollectionReference, Firestore } from '@angular/fire/firestore';
import { PersistedDataManagerState, PersistedDictionaryEntry, PersistedTeamData } from './data-manager.types';
import { TeamData } from './team-data';
import { AppStateManagerService } from '../app-state-manager/app-state-manager.service';

@Injectable({
    providedIn: 'root'
})
export class DataManagerService {

    private readonly persistentData = new PersistentData<PersistedDataManagerState>(persistentDataKeys.dataManager);

    private observingUserId: string | null = null;

    private isObserving = false;

    public teams = new Dictionary<Team.Id, TeamData>(Team.Id.builder);

    public notifications$ = new Observable<Dictionary<InAppNotification.Id, InAppNotification>>();

    private observers = {
        notifications: new Observer<InAppNotification.Id, InAppNotification>(InAppNotification.Id.builder, InAppNotification.builder)
    };

    private firestore = inject(Firestore);

    private appStateManager = inject(AppStateManagerService);

    public get selectedTeam$(): Observable<TeamData | null> {
        return Observable.combine(this.appStateManager.selectedTeamId$, this.appStateManager.user$, (teamId, user) => {
            if (teamId === null || user === null)
                return null;
            return this.teams.getOptional(teamId);
        });
    }

    public startObserve(user: User, changeDetector: ChangeDetectorRef) {
        if (this.isObserving && this.observingUserId === user.id.guidString)
            return;

        if (this.observingUserId !== null && this.observingUserId !== user.id.guidString)
            this.reset();

        const persistedState = this.loadPersistedState(user.id.guidString);
        const persistedTeams = new Map<string, PersistedTeamData>(
            (persistedState?.teams ?? []).map(teamData => [teamData.id, teamData.value])
        );

        this.startTeamObservers(user, persistedTeams, changeDetector);
        this.notifications$.next(this.deserializeNotifications(persistedState?.notifications ?? null));
        this.startNotificationsObserver(user.id.guidString, changeDetector);

        this.observingUserId = user.id.guidString;
        this.isObserving = true;
        this.persistState();
    }

    public stopObserve() {
        this.stopTeamObservers();
        this.stopAllObservers();
        this.isObserving = false;
    }

    public reset() {
        this.teams.values.forEach(teamData => teamData.reset());
        this.teams = new Dictionary<Team.Id, TeamData>(Team.Id.builder);
        this.stopObserve();
        this.notifications$ = new Observable<Dictionary<InAppNotification.Id, InAppNotification>>();
        this.observingUserId = null;
        this.persistentData.remove();
    }

    private startTeamObservers(user: User, persistedTeams: Map<string, PersistedTeamData>, changeDetector: ChangeDetectorRef): void {
        user.teams.keys.forEach(teamId => {
            const teamData = new TeamData(this.firestore, () => this.persistState());

            const persistedTeamData = persistedTeams.get(teamId.guidString);
            if (persistedTeamData !== undefined)
                teamData.hydrate(persistedTeamData);

            teamData.startObserve(teamId, changeDetector);
            this.teams.set(teamId, teamData);
        });
    }

    private startNotificationsObserver(userId: string, changeDetector: ChangeDetectorRef): void {
        const notificationsCollection = collection(this.firestore, 'users', userId, 'notifications') as CollectionReference<Flattable.Flatten<InAppNotification>>;
        const notifications$ = this.observers.notifications.start(notificationsCollection, this.notifications$.value);
        notifications$.subscribe({
            next: notifications => {
                this.notifications$.next(notifications);
                this.persistState();
                changeDetector.markForCheck();
            },
            error: error => this.notifications$.error(error),
            complete: () => this.notifications$.complete()
        });
    }

    private stopTeamObservers(): void {
        this.teams.values.forEach(teamData => teamData.stopObserve());
    }

    private stopAllObservers(): void {
        values(this.observers).forEach(observer => observer.stop());
    }

    private persistState() {
        if (this.observingUserId === null)
            return;

        const persistedState: PersistedDataManagerState = {
            userId: this.observingUserId,
            teams: this.teams.entries.map(({ key, value }) => ({
                id: key.guidString,
                value: value.toPersistedState()
            })),
            notifications: this.serializeNotifications(this.notifications$.value)
        };

        this.persistentData.save(persistedState);
    }

    private loadPersistedState(userId: string): PersistedDataManagerState | null {
        const persistedState = this.persistentData.load();
        if (persistedState === null)
            return null;

        if (persistedState.userId !== userId)
            return null;

        return persistedState;
    }

    private serializeNotifications(
        notifications: Dictionary<InAppNotification.Id, InAppNotification> | null
    ): PersistedDictionaryEntry<Flattable.Flatten<InAppNotification>>[] | null {
        if (notifications === null)
            return null;

        return notifications.entries.map(({ key, value }) => ({
            id: key.guidString,
            value: value.flatten
        }));
    }

    private deserializeNotifications(
        notifications: PersistedDictionaryEntry<Flattable.Flatten<InAppNotification>>[] | null
    ): Dictionary<InAppNotification.Id, InAppNotification> | null {
        if (notifications === null)
            return null;

        const dictionary = new Dictionary<InAppNotification.Id, InAppNotification>(InAppNotification.Id.builder);
        notifications.forEach(({ id, value }) => dictionary.set(InAppNotification.Id.builder.build(id), InAppNotification.builder.build(value)));
        return dictionary;
    }

}
