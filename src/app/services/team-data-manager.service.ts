import { inject, Injectable } from '@angular/core';
import { Team, TeamId } from '../types/Team';
import { Amount, Fine, FineId, FineTemplate, FineTemplateId, Person, PersonId, PersonWithFines } from '../types';
import { Firestore, doc, collection, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { Flatten } from '../types/Flattable';
import { Observer } from '../types/Observer';
import { values } from '../utils';
import { combineLatest, map, Observable } from 'rxjs';
import { Dictionary } from '../types/Dictionary';
import { compactMap } from '../utils/compactMap';

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

        this.persons$ = combineLatest([persons$, this.fines$]).pipe(map(([persons, fines]) => {
            return persons.map<PersonWithFines>(person => {
                const personFines = compactMap(person.fineIds, fineId => fines.getOptional(fineId));
                return {
                    id: person.id,
                    properties: person.properties,
                    signInProperties: person.signInProperties,
                    fines: personFines,
                    amounts: personFines.reduce((amounts, fine) => ({
                        total: amounts.total.added(fine.amount),
                        payed: amounts.payed.added(fine.payedState === 'payed' ?  fine.amount : Amount.zero),
                        notPayed: amounts.notPayed.added(fine.payedState === 'notPayed' ?  fine.amount : Amount.zero)
                    }), { total: Amount.zero, payed: Amount.zero, notPayed: Amount.zero })
                };
            });
        }));
    }

    public stopObserve() {
        values(this.observers).forEach(observer => observer.stop());
    }
}
