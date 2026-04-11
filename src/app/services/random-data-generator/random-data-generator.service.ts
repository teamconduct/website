import { inject, Injectable } from '@angular/core';
import { UserManagerService } from '../user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../firebase-functions/firebase-functions.service';
import { Fine, FineTemplate, Money, Person, PersonProperties, Team, TeamRole } from '@stevenkellner/team-conduct-api';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { isProduction } from '../../../environments/environment';
import { ConfigurationService } from '../configuration/configuration.service';

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

    private readonly developmentFines: Array<{ reason: string; payedState: 'payed' | 'notPayed'; amount: Fine.Amount }> = [
        {
            reason: 'Arrived after kick-off briefing',
            payedState: 'notPayed',
            amount: Fine.Amount.money(new Money(5, 0))
        },
        {
            reason: 'Forgot captain armband',
            payedState: 'payed',
            amount: Fine.Amount.money(new Money(8, 0))
        },
        {
            reason: 'No post-match clean-up help',
            payedState: 'notPayed',
            amount: Fine.Amount.money(new Money(10, 0))
        },
        {
            reason: 'Team event beverage contribution',
            payedState: 'payed',
            amount: Fine.Amount.item('crateOfBeer', 1)
        },
        {
            reason: 'Missed attendance confirmation',
            payedState: 'notPayed',
            amount: Fine.Amount.money(new Money(2, 50))
        },
        {
            reason: 'Training bibs not returned',
            payedState: 'payed',
            amount: Fine.Amount.money(new Money(4, 0))
        },
        {
            reason: 'Late cancellation',
            payedState: 'notPayed',
            amount: Fine.Amount.money(new Money(6, 0))
        },
        {
            reason: 'Locker room music fine',
            payedState: 'payed',
            amount: Fine.Amount.item('crateOfBeer', 2)
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

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private configurationService = inject(ConfigurationService);

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
                currency: this.configurationService.currency,
                locale: this.configurationService.locale
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
                    UtcDate.now,
                    fine.reason,
                    fine.amount
                )
            });
        }
    }
}
