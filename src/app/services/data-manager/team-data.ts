import { ChangeDetectorRef } from '@angular/core';
import { collection, CollectionReference, doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { Fine, FineTemplate, Person, Team } from '@stevenkellner/team-conduct-api';
import { compactMap, Dictionary, Flattable, values } from '@stevenkellner/typescript-common-functionality';
import { Observable, Observer } from '../../types';
import { PersonWithFines } from '../../types/PersonWithFines';
import { PersistedDictionaryEntry, PersistedTeamData } from './data-manager.types';

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
        private readonly firestore: Firestore,
        private readonly onChange?: () => void
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

        this.observeAndForward(
            this.observers.team.start(teamDocument, this.team$.value),
            this.team$,
            changeDetector
        );
        this.observeAndForward(
            this.observers.persons.start(personsCollection, this.personsWithoutFines$.value),
            this.personsWithoutFines$,
            changeDetector
        );
        this.observeAndForward(
            this.observers.fineTemplates.start(fineTemplatesCollection, this.fineTemplates$.value),
            this.fineTemplates$,
            changeDetector
        );
        this.observeAndForward(
            this.observers.fines.start(finesCollection, this.fines$.value),
            this.fines$,
            changeDetector
        );
    }

    public stopObserve() {
        this.stopAllObservers();
    }

    public reset() {
        this.stopObserve();
        this.team$ = new Observable<Team>();
        this.personsWithoutFines$ = new Observable<Dictionary<Person.Id, Person>>();
        this.fineTemplates$ = new Observable<Dictionary<FineTemplate.Id, FineTemplate>>();
        this.fines$ = new Observable<Dictionary<Fine.Id, Fine>>();
        this.onChange?.();
    }

    public hydrate(state: PersistedTeamData) {
        if (state.team !== null)
            this.team$.next(Team.builder.build(state.team));

        this.personsWithoutFines$.next(this.deserializePersons(state.persons));
        this.fineTemplates$.next(this.deserializeFineTemplates(state.fineTemplates));
        this.fines$.next(this.deserializeFines(state.fines));
    }

    public toPersistedState(): PersistedTeamData {
        return {
            team: this.team$.value?.flatten ?? null,
            persons: this.serializePersons(this.personsWithoutFines$.value),
            fineTemplates: this.serializeFineTemplates(this.fineTemplates$.value),
            fines: this.serializeFines(this.fines$.value)
        };
    }

    private serializePersons(dictionary: Dictionary<Person.Id, Person> | null): PersistedDictionaryEntry<Flattable.Flatten<Person>>[] | null {
        if (dictionary === null)
            return null;

        return dictionary.entries.map(({ key, value }) => ({
            id: key.guidString,
            value: value.flatten
        }));
    }

    private serializeFineTemplates(dictionary: Dictionary<FineTemplate.Id, FineTemplate> | null): PersistedDictionaryEntry<Flattable.Flatten<FineTemplate>>[] | null {
        if (dictionary === null)
            return null;

        return dictionary.entries.map(({ key, value }) => ({
            id: key.guidString,
            value: value.flatten
        }));
    }

    private serializeFines(dictionary: Dictionary<Fine.Id, Fine> | null): PersistedDictionaryEntry<Flattable.Flatten<Fine>>[] | null {
        if (dictionary === null)
            return null;

        return dictionary.entries.map(({ key, value }) => ({
            id: key.guidString,
            value: value.flatten
        }));
    }

    private deserializePersons(entries: PersistedDictionaryEntry<Flattable.Flatten<Person>>[] | null): Dictionary<Person.Id, Person> | null {
        if (entries === null)
            return null;

        const dictionary = new Dictionary<Person.Id, Person>(Person.Id.builder);
        entries.forEach(({ id, value }) => dictionary.set(Person.Id.builder.build(id), Person.builder.build(value)));
        return dictionary;
    }

    private deserializeFineTemplates(entries: PersistedDictionaryEntry<Flattable.Flatten<FineTemplate>>[] | null): Dictionary<FineTemplate.Id, FineTemplate> | null {
        if (entries === null)
            return null;

        const dictionary = new Dictionary<FineTemplate.Id, FineTemplate>(FineTemplate.Id.builder);
        entries.forEach(({ id, value }) => dictionary.set(FineTemplate.Id.builder.build(id), FineTemplate.builder.build(value)));
        return dictionary;
    }

    private deserializeFines(entries: PersistedDictionaryEntry<Flattable.Flatten<Fine>>[] | null): Dictionary<Fine.Id, Fine> | null {
        if (entries === null)
            return null;

        const dictionary = new Dictionary<Fine.Id, Fine>(Fine.Id.builder);
        entries.forEach(({ id, value }) => dictionary.set(Fine.Id.builder.build(id), Fine.builder.build(value)));
        return dictionary;
    }

    private observeAndForward<T>(source: Observable<T>, target: Observable<T>, changeDetector: ChangeDetectorRef): void {
        source.subscribe({
            next: value => {
                target.next(value);
                this.onChange?.();
                changeDetector.markForCheck();
            },
            error: error => target.error(error),
            complete: () => target.complete()
        });
    }

    private stopAllObservers(): void {
        values(this.observers).forEach(observer => observer.stop());
    }
}
