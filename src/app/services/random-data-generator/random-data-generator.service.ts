import { inject, Injectable } from '@angular/core';
import { FirebaseFunctionsService } from '../firebase-functions/firebase-functions.service';
import { Fine, FineTemplate, Money, PayedState, Person, PersonProperties, Team, TeamRole } from '@stevenkellner/team-conduct-api';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { isProduction } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RandomDataGeneratorService {

    private readonly developmentPersons: PersonProperties[] = [
        new PersonProperties('Alex', 'Meyer'),
        new PersonProperties('Sam', 'Fischer'),
        new PersonProperties('Jordan', 'Weber'),
        new PersonProperties('Taylor', 'Klein'),
        new PersonProperties('Chris', 'Wagner'),
        new PersonProperties('Pat', 'Hoffmann')
    ];

    private readonly developmentFineTemplates: Array<{ reason: string; amount: Fine.Amount; repetition: FineTemplate.Repetition | null }> = [
        {
            reason: 'Late to training',
            amount: Fine.Amount.money(new Money(5, 0)),
            repetition: null
        },
        {
            reason: 'Forgot team jersey',
            amount: Fine.Amount.money(new Money(10, 0)),
            repetition: null
        },
        {
            reason: 'Missed warm-up',
            amount: Fine.Amount.money(new Money(7, 50)),
            repetition: new FineTemplate.Repetition('count', 3)
        },
        {
            reason: 'Bring a crate for the next social',
            amount: Fine.Amount.item('crateOfBeer', 1),
            repetition: null
        },
        {
            reason: 'Clean-up duty skipped',
            amount: Fine.Amount.money(new Money(12, 0)),
            repetition: new FineTemplate.Repetition('day', 2)
        },
        {
            reason: 'Match day snack fund',
            amount: Fine.Amount.money(new Money(3, 50)),
            repetition: new FineTemplate.Repetition('item', 5)
        }
    ];

    private readonly developmentFines: Array<{ reason: string; payedState: PayedState; amount: Fine.Amount }> = [
        {
            reason: 'Arrived after kick-off briefing',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(5, 0))
        },
        {
            reason: 'Forgot captain armband',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.money(new Money(8, 0))
        },
        {
            reason: 'No post-match clean-up help',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(10, 0))
        },
        {
            reason: 'Team event beverage contribution',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.item('crateOfBeer', 1)
        },
        {
            reason: 'Missed attendance confirmation',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(2, 50))
        },
        {
            reason: 'Training bibs not returned',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.money(new Money(4, 0))
        },
        {
            reason: 'Late cancellation',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(6, 0))
        },
        {
            reason: 'Locker room music fine',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.item('crateOfBeer', 2)
        },
        {
            reason: 'Equipment damage',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(15, 0))
        },
        {
            reason: 'Unsportsmanlike conduct',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.money(new Money(20, 0))
        },
        {
            reason: 'Missed training session',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(10, 0))
        },
        {
            reason: 'Uniform not cleaned',
            payedState: new PayedState.Payed(UtcDate.now),
            amount: Fine.Amount.money(new Money(5, 50))
        },
        {
            reason: 'Late arrival to match',
            payedState: new PayedState.NotPayed(),
            amount: Fine.Amount.money(new Money(8, 0))
        }
    ];

    private readonly developmentTeams: Array<{ name: string; roles: TeamRole[] }> = [
        {
            name: 'Team Conduct Owner',
            roles: [...TeamRole.all]
        },
        {
            name: 'Only Team Manager',
            roles: ['team-manager']
        }
    ];

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public async createDevelopmentTeamsForNewUser(): Promise<void> {
        if (isProduction)
            return;

        for (const team of this.developmentTeams) {
            const teamId: Team.Id = Tagged.generate('team');
            const teamPersonId: Person.Id = Tagged.generate('person');

            await this.firebaseFunctions.functions.team.new.execute({
                id: teamId,
                teamPersonId,
                name: team.name,
                logoUrl: null,
                sportCategory: null,
                description: null,
                paypalMeLink: null,
                currency: 'USD',
                locale: 'en'
            });

            await this.firebaseFunctions.functions.person.roleEdit.execute({
                teamId,
                personId: teamPersonId,
                roles: team.roles
            });

            const personIds = await this.createTestPersons(teamId, teamPersonId);
            await this.createTestFineTemplates(teamId);
            await this.createTestFines(teamId, personIds);
        }
    }

    private async createTestPersons(teamId: Team.Id, personId: Person.Id): Promise<Person.Id[]> {
        const personIds: Person.Id[] = [personId];

        for (const properties of this.developmentPersons) {
            const additionalPersonId: Person.Id = Tagged.generate('person');
            personIds.push(additionalPersonId);

            await this.firebaseFunctions.functions.person.add.execute({
                teamId,
                id: additionalPersonId,
                properties
            });
        }

        return personIds;
    }

    private async createTestFineTemplates(teamId: Team.Id) {
        for (const template of this.developmentFineTemplates) {
            await this.firebaseFunctions.functions.fineTemplate.add.execute({
                teamId,
                fineTemplate: new FineTemplate(
                    Tagged.generate('fineTemplate'),
                    template.reason,
                    template.amount,
                    template.repetition
                )
            });
        }
    }

    private async createTestFines(teamId: Team.Id, personIds: Person.Id[]) {
        for (const [index, fine] of this.developmentFines.entries()) {
            await this.firebaseFunctions.functions.fine.add.execute({
                teamId,
                personId: personIds[index % personIds.length],
                fine: new Fine(
                    Tagged.generate('fine'),
                    fine.payedState,
                    UtcDate.now.advanced({ day: -index }),
                    fine.reason,
                    fine.amount
                )
            });
        }
    }
}
