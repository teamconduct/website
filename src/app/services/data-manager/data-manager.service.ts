import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { Observable, Observer } from '../../types';
import { Fine, FineTemplate, InAppNotification, Person, Team, User } from '@stevenkellner/team-conduct-api';
import { compactMap, Dictionary, Flattable, ITypeBuilder, values } from '@stevenkellner/typescript-common-functionality';
import { PersonWithFines } from '../../types/PersonWithFines';
import { collection, CollectionReference, doc, DocumentReference, Firestore } from '@angular/fire/firestore';

export class TeamData {

    private observers = {
        team: new Observer<Team.Id, Team>(Team.Id.builder, Team.builder),
        persons: new Observer<Person.Id, Person>(Person.Id.builder, Person.builder),
        fineTemplates: new Observer<FineTemplate.Id, FineTemplate>(FineTemplate.Id.builder, FineTemplate.builder),
        fines: new Observer<Fine.Id, Fine>(Fine.Id.builder, Fine.builder)
    };

    public team$ = new Observable<Team>();

    private personsWithoutFines$ = new Observable<Dictionary<Person.Id, Person>>();

    public fineTemplates$ = new Observable<Dictionary<FineTemplate.Id, FineTemplate>>();

    public fines$ = new Observable<Dictionary<Fine.Id, Fine>>();

    public constructor(
        private readonly firestore: Firestore
    ) {}

    public persons$ = Observable.combine(this.personsWithoutFines$, this.fines$, (persons, fines) =>
        persons.map<PersonWithFines>(person =>
            new PersonWithFines(person, compactMap(person.fineIds, fineId => fines.getOptional(fineId)))
        )
    );

    public startObserve(teamId: Team.Id, changeDetector: ChangeDetectorRef) {
        const teamDocument = doc(this.firestore, 'teams', teamId.guidString) as DocumentReference<Flattable.Flatten<Team>>;
        const personsCollection = collection(this.firestore, 'teams', teamId.guidString, 'persons') as CollectionReference<Flattable.Flatten<Person>>;
        const fineTemplatesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fineTemplates') as CollectionReference<Flattable.Flatten<FineTemplate>>;
        const finesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fines') as CollectionReference<Flattable.Flatten<Fine>>;

        const team$ = this.observers.team.start(teamDocument);
        const personsWithoutFines$ = this.observers.persons.start(personsCollection);
        const fineTemplates$ = this.observers.fineTemplates.start(fineTemplatesCollection);
        const fines$ = this.observers.fines.start(finesCollection);

        team$.subscribe({
            next: team => {
                this.team$.next(team);
                changeDetector.markForCheck();
            },
            error: error => this.team$.error(error),
            complete: () => this.team$.complete()
        });
        personsWithoutFines$.subscribe({
            next: personsWithoutFines => {
                this.personsWithoutFines$.next(personsWithoutFines);
                changeDetector.markForCheck();
            },
            error: error => this.personsWithoutFines$.error(error),
            complete: () => this.personsWithoutFines$.complete()
        });
        fineTemplates$.subscribe({
            next: fineTemplates => {
                this.fineTemplates$.next(fineTemplates);
                changeDetector.markForCheck();
            },
            error: error => this.fineTemplates$.error(error),
            complete: () => this.fineTemplates$.complete()
        });
        fines$.subscribe({
            next: fines => {
                this.fines$.next(fines);
                changeDetector.markForCheck();
            },
            error: error => this.fines$.error(error),
            complete: () => this.fines$.complete()
        });
    }

    public stopObserve() {
        values(this.observers).forEach(observer => observer.stop());
    }

    public reset() {
        this.stopObserve();
        this.team$ = new Observable<Team>();
        this.personsWithoutFines$ = new Observable<Dictionary<Person.Id, Person>>();
        this.fineTemplates$ = new Observable<Dictionary<FineTemplate.Id, FineTemplate>>();
        this.fines$ = new Observable<Dictionary<Fine.Id, Fine>>();
    }
}

@Injectable({
    providedIn: 'root'
})
export class DataManagerService {

    public teams = new Dictionary<Team.Id, TeamData>(Team.Id.builder);

    public notifications$ = new Observable<Dictionary<InAppNotification.Id, InAppNotification>>();

    private observers = {
        notifications: new Observer<InAppNotification.Id, InAppNotification>(InAppNotification.Id.builder, InAppNotification.builder)
    };

    private firestore = inject(Firestore);

    public startObserve(user: User, changeDetector: ChangeDetectorRef) {
        user.teams.keys.forEach(teamId => {
            const teamData = new TeamData(this.firestore);
            teamData.startObserve(teamId, changeDetector);
            this.teams.set(teamId, teamData);
        });

        const notificationsCollection = collection(this.firestore, 'users', user.id.guidString, 'notifications') as CollectionReference<Flattable.Flatten<InAppNotification>>;
        const notifications$ = this.observers.notifications.start(notificationsCollection);
        notifications$.subscribe({
            next: notifications => {
                this.notifications$.next(notifications);
                changeDetector.markForCheck();
            },
            error: error => this.notifications$.error(error),
            complete: () => this.notifications$.complete()
        });
    }

    public stopObserve() {
        this.teams.values.forEach(teamData => teamData.stopObserve());
        values(this.observers).forEach(observer => observer.stop());
    }

    public reset() {
        this.teams.values.forEach(teamData => teamData.reset());
        this.teams = new Dictionary<Team.Id, TeamData>(Team.Id.builder);
        this.stopObserve();
        this.notifications$ = new Observable<Dictionary<InAppNotification.Id, InAppNotification>>();
    }
}
