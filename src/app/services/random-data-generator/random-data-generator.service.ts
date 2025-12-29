import { inject, Injectable } from '@angular/core';
import { UserManagerService } from '../user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../firebase-functions/firebase-functions.service';
import { Fine, FineAmount, FineTemplate, FineTemplateRepetition, MoneyAmount, Person, PersonPrivateProperties, Team } from '@stevenkellner/team-conduct-api';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { isProduction } from '../../../environments/environment';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable({
    providedIn: 'root'
})
export class RandomDataGeneratorService {

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private configurationService = inject(ConfigurationService);

    private async createTestPersons(teamId: Team.Id, personId: Person.Id): Promise<Person.Id[]> {
        const personIds: Person.Id[] = [personId];
        await Promise.all(new Array(10).fill(null).map(async (_, i) => {
            const personId: Person.Id = Tagged.generate('person');
            personIds.push(personId);
            await this.firebaseFunctions.functions.person.add.execute({
                teamId: teamId,
                id: personId,
                properties: new PersonPrivateProperties(`Test${i}`, 'Person')
            });
        }));
        return personIds;
    }

    private async createTestFineTemplates(teamId: Team.Id) {
        await Promise.all(new Array(50).fill(null).map(async (_, i) => {
            await this.firebaseFunctions.functions.fineTemplate.add.execute({
                teamId: teamId,
                fineTemplate: new FineTemplate(
                    Tagged.generate('fineTemplate'),
                    `Test Fine Template ${i}`,
                    Math.random() < 0.5 ? FineAmount.money(new MoneyAmount(i, 0)) : FineAmount.item('crateOfBeer', i),
                    Math.random() < 0.5 ? null : new FineTemplateRepetition('item', Math.random() < 0.5 ? null : Math.floor(Math.random() * 10))
                )
            });
        }));
    }

    private async createTestFines(teamId: Team.Id, personIds: Person.Id[]) {
        await Promise.all(new Array(100).fill(null).map(async (_, i) => {
            await this.firebaseFunctions.functions.fine.add.execute({
                teamId: teamId,
                personId: personIds[Math.floor(Math.random() * personIds.length)],
                fine: new Fine(
                    Tagged.generate('fine'),
                    Math.random() < 0.5 ? 'payed' : 'notPayed',
                    UtcDate.now,
                    `Test Fine ${i}`,
                    Math.random() < 0.5 ? FineAmount.money(new MoneyAmount(i, 0)) : FineAmount.item('crateOfBeer', i)
                ),
                configuration: this.configurationService.configuration
            });
        }));
    }

    public async createTestData() {
        if (isProduction)
            return;
        if (this.userManager.user$.value === null || this.userManager.selectedTeamId$.value === null)
            return;
        const teamId = this.userManager.selectedTeamId$.value;
        const personId = this.userManager.user$.value.teams.get(teamId)!.personId;
        const personIds = await this.createTestPersons(teamId, personId);
        await this.createTestFineTemplates(teamId);
        await this.createTestFines(teamId, personIds);
    }
}
