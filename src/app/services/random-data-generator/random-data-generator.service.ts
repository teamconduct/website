import { inject, Injectable } from '@angular/core';
import { FirebaseFunctionsService } from '../firebase-functions/firebase-functions.service';
import { Fine, FineTemplate, Money, PayedState, Person, PersonProperties, Team, TeamRole } from '@stevenkellner/team-conduct-api';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { isProduction } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RandomDataGeneratorService {

    private readonly developmentTeams: Array<{ name: string; roles: TeamRole[] }> = [
        {
            name: 'Team Conduct Owner',
            roles: [...TeamRole.all]
        },
        {
            name: 'Only Team Manager',
            roles: ['team-manager']
        },
        {
            name: 'My Team 1',
            roles: [...TeamRole.all]
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

        for (let i = 0; i < this.randomInt(15, 35); i++) {
            const additionalPersonId: Person.Id = Tagged.generate('person');
            personIds.push(additionalPersonId);

            await this.firebaseFunctions.functions.person.add.execute({
                teamId,
                id: additionalPersonId,
                properties: new PersonProperties(
                    this.randomElement(this.firstNames),
                    this.randomElement(this.lastNames),
                    null
                )
            });
        }

        return personIds;
    }

    private async createTestFineTemplates(teamId: Team.Id) {
        for (let index = 0; index < this.randomInt(15, 25); index++) {
            await this.firebaseFunctions.functions.fineTemplate.add.execute({
                teamId,
                fineTemplate: new FineTemplate(
                    Tagged.generate('fineTemplate'),
                    this.randomElement(this.fineReasons),
                    this.randomFineAmount(),
                    this.randomRepetition()
                )
            });
        }
    }

    private async createTestFines(teamId: Team.Id, personIds: Person.Id[]) {
        for (let index = 0; index < this.randomInt(50, 100); index++) {
            await this.firebaseFunctions.functions.fine.add.execute({
                teamId,
                personId: personIds[index % personIds.length],
                fine: new Fine(
                    Tagged.generate('fine'),
                    this.randomPayedState(),
                    UtcDate.now.advanced({ day: -index }),
                    this.randomElement(this.fineReasons),
                    this.randomFineAmount()
                )
            });
        }
    }

    private readonly firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry', 'Isabelle', 'James', 'Karen', 'Leo', 'Maria', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tina'];
    private readonly lastNames = ['Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Fischer', 'Garcia', 'Harris', 'Johnson', 'Klein', 'Lee', 'Miller', 'Nelson', 'Owen', 'Parker', 'Quinn', 'Roberts', 'Smith', 'Taylor', 'Vogel'];
    private readonly fineReasons = ['Late to training', 'Missing equipment', 'Missed game', 'Unsportsmanlike conduct', 'Late payment', 'No jersey', 'Forgot water bottle', 'Late to team meeting', 'Not warming up', 'Using phone during game'];

    private randomFineAmount(): Fine.Amount {
        if (Math.random() < 0.8)
            return new Fine.Amount.Money(new Money(this.randomInt(1, 50), this.randomElement([0, 0, 0, 50])));
        return new Fine.Amount.Item('crateOfBeer', this.randomInt(1, 5));
    }

    private randomRepetition(): FineTemplate.Repetition | null {
        if (Math.random() < 0.4)
            return null;
        const items: FineTemplate.Repetition.Item[] = ['minute', 'day', 'item', 'count'];
        return new FineTemplate.Repetition(
            this.randomElement(items),
            Math.random() < 0.5 ? null : this.randomInt(2, 10)
        );
    }

    private randomPayedState(): PayedState {
        if (Math.random() < 0.5)
            return new PayedState.NotPayed();
        return new PayedState.Payed(UtcDate.now.advanced({ day: -this.randomInt(1, 30) }));
    }

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private randomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private shuffled<T>(array: T[]): T[] {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }
}
