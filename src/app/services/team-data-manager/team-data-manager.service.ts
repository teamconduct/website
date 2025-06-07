import { inject, Injectable } from '@angular/core';
import { Observable, Observer, SummedFineValue } from '../../types';
import { Fine, FineTemplate, Person, Team } from '@stevenkellner/team-conduct-api';
import { compactMap, Dictionary, Flattable, values } from '@stevenkellner/typescript-common-functionality';
import { PersonWithFines } from '../../types/PersonWithFines';
import { collection, CollectionReference, doc, DocumentReference, Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class TeamDataManagerService {

    public team$ = new Observable<Team>();

    public persons$ = new Observable<Dictionary<Person.Id, PersonWithFines>>();

    public fineTemplates$ = new Observable<Dictionary<FineTemplate.Id, FineTemplate>>();

    public fines$ = new Observable<Dictionary<Fine.Id, Fine>>();

    private observers = {
        team: new Observer<Team.Id, Team>(Team.Id.builder, Team.builder),
        persons: new Observer<Person.Id, Person>(Person.Id.builder, Person.builder),
        fineTemplates: new Observer<FineTemplate.Id, FineTemplate>(FineTemplate.Id.builder, FineTemplate.builder),
        fines: new Observer<Fine.Id, Fine>(Fine.Id.builder, Fine.builder)
    };

    private firestore = inject(Firestore);

    public startObserve(teamId: Team.Id) {
        const teamDocument = doc(this.firestore, 'teams', teamId.guidString) as DocumentReference<Flattable.Flatten<Team>>;
        const personsCollection = collection(this.firestore, 'teams', teamId.guidString, 'persons') as CollectionReference<Flattable.Flatten<Person>>;
        const fineTemplatesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fineTemplates') as CollectionReference<Flattable.Flatten<FineTemplate>>;
        const finesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fines') as CollectionReference<Flattable.Flatten<Fine>>;

        this.team$ = this.observers.team.start(teamDocument);
        const persons$ = this.observers.persons.start(personsCollection);
        this.fineTemplates$ = this.observers.fineTemplates.start(fineTemplatesCollection);
        this.fines$ = this.observers.fines.start(finesCollection);

        this.persons$ = Observable.combine(persons$, this.fines$, (persons, fines) => {
            return persons.map<PersonWithFines>(person => {
                const personFines = compactMap(person.fineIds, fineId => fines.getOptional(fineId));
                return new PersonWithFines(
                    person.id,
                    person.properties,
                    person.signInProperties,
                    personFines,
                    personFines.reduce((fineValues, fine) => {
                        fineValues.total.add(fine.amount);
                        if (fine.payedState === 'payed')
                            fineValues.payed.add(fine.amount);
                        if (fine.payedState === 'notPayed')
                            fineValues.notPayed.add(fine.amount);
                        return fineValues;
                    }, { total: new SummedFineValue(), payed: new SummedFineValue(), notPayed: new SummedFineValue() })
                );
            });
        });
    }

    public stopObserve() {
        values(this.observers).forEach(observer => observer.stop());
    }

    public reset() {
        this.stopObserve();
        this.team$ = new Observable<Team>();
        this.persons$ = new Observable<Dictionary<Person.Id, PersonWithFines>>();
        this.fineTemplates$ = new Observable<Dictionary<FineTemplate.Id, FineTemplate>>();
        this.fines$ = new Observable<Dictionary<Fine.Id, Fine>>();
    }
}
