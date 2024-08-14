import { inject, Injectable } from '@angular/core';
import { Team, TeamId } from '../types/Team';
import { Fine, FineId, FineTemplate, FineTemplateId, Person, PersonId, PersonWithFines } from '../types';
import { Firestore, doc, collection, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { Flatten } from '../types/Flattable';
import { Observer } from '../types/Observer';
import { values } from '../utils';
import { Dictionary } from '../types/Dictionary';
import { compactMap } from '../utils/compactMap';
import { combine, Observable } from '../types/Observable';
import { SummedFineValue } from '../types/SummedFineValue';

@Injectable({
    providedIn: 'root'
})
export class TeamDataManagerService {

    public team$ = new Observable<Team>();

    public persons$ = new Observable<Dictionary<PersonId, PersonWithFines>>();

    public fineTemplates$ = new Observable<Dictionary<FineTemplateId, FineTemplate>>();

    public fines$ = new Observable<Dictionary<FineId, Fine>>();

    private observers = {
        team: new Observer<TeamId, Team>(TeamId.builder, Team.builder),
        persons: new Observer<PersonId, Person>(PersonId.builder, Person.builder),
        fineTemplates: new Observer<FineTemplateId, FineTemplate>(FineTemplateId.builder, FineTemplate.builder),
        fines: new Observer<FineId, Fine>(FineId.builder, Fine.builder)
    };

    private firestore = inject(Firestore);

    public startObserve(teamId: TeamId) {
        const teamDocument = doc(this.firestore, 'teams', teamId.guidString) as DocumentReference<Flatten<Team>>;
        const personsCollection = collection(this.firestore, 'teams', teamId.guidString, 'persons') as CollectionReference<Flatten<Person>>;
        const fineTemplatesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fineTemplates') as CollectionReference<Flatten<FineTemplate>>;
        const finesCollection = collection(this.firestore, 'teams', teamId.guidString, 'fines') as CollectionReference<Flatten<Fine>>;

        this.team$ = this.observers.team.start(teamDocument);
        const persons$ = this.observers.persons.start(personsCollection);
        this.fineTemplates$ = this.observers.fineTemplates.start(fineTemplatesCollection);
        this.fines$ = this.observers.fines.start(finesCollection);

        this.persons$ = combine(persons$, this.fines$, (persons, fines) => {
            return persons.map<PersonWithFines>(person => {
                const personFines = compactMap(person.fineIds, fineId => fines.getOptional(fineId));
                return {
                    id: person.id,
                    properties: person.properties,
                    signInProperties: person.signInProperties,
                    fines: personFines,
                    fineValues: personFines.reduce((fineValues, fine) => {
                        fineValues.total.add(fine.value);
                        if (fine.payedState === 'payed')
                            fineValues.payed.add(fine.value);
                        if (fine.payedState === 'notPayed')
                            fineValues.notPayed.add(fine.value);
                        return fineValues;
                    }, { total: new SummedFineValue(), payed: new SummedFineValue(), notPayed: new SummedFineValue() })
                };
            });
        });
    }

    public stopObserve() {
        values(this.observers).forEach(observer => observer.stop());
    }

    public reset() {
        this.stopObserve();
        this.team$ = new Observable<Team>();
        this.persons$ = new Observable<Dictionary<PersonId, PersonWithFines>>();
        this.fineTemplates$ = new Observable<Dictionary<FineTemplateId, FineTemplate>>();
        this.fines$ = new Observable<Dictionary<FineId, Fine>>();
    }
}
