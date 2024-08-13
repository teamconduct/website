import { inject, Injectable } from '@angular/core';
import { PersonId, Amount } from '../types';
import { Tagged } from '../types/Tagged';
import { TeamId } from '../types/Team';
import { UtcDate } from '../types/UtcDate';
import { UserManagerService } from './user-manager.service';
import { FirebaseFunctionsService } from './firebase-functions.service';
import { isProduction } from '../../environments/environment';
import { FineValue } from '../types/FineValue';

@Injectable({
    providedIn: 'root'
})
export class RandomDataGeneratorService {

    private userManager = inject(UserManagerService);

    private firebaseFunctionsService = inject(FirebaseFunctionsService);

    private async createTestPersons(teamId: TeamId, personId: PersonId): Promise<PersonId[]> {
        const personIds: PersonId[] = [personId];
        for (let i = 1; i <= 10; i++) {
            const personId: PersonId = Tagged.generate('person');
            personIds.push(personId);
            await this.firebaseFunctionsService.function('person').function('add').call({
                teamId: teamId,
                person: {
                    id: personId,
                    properties: {
                        firstName: `Test${i}`,
                        lastName: 'Person'
                    }
                }
            });
        }
        return personIds;
    }

    private async createTestFineTemplates(teamId: TeamId) {
        for (let i = 1; i <= 50; i++) {
            await this.firebaseFunctionsService.function('fineTemplate').function('add').call({
                teamId: teamId,
                fineTemplate: {
                    id: Tagged.generate('fineTemplate'),
                    reason: `Test Fine Template ${i}`,
                    value: Math.random() < 0.5 ? FineValue.amount(new Amount(i, 0)) : FineValue.item('crateOfBeer', i),
                    multiple: Math.random() < 0.5 ? null : {
                        item: 'item',
                        maxCount: Math.random() < 0.5 ? null : Math.floor(Math.random() * 10)
                    }
                }
            });
        }
    }

    private async createTestFines(teamId: TeamId, personIds: PersonId[]) {
        for (let i = 1; i <= 100; i++) {
            await this.firebaseFunctionsService.function('fine').function('add').call({
                teamId: teamId,
                personId: personIds[Math.floor(Math.random() * personIds.length)],
                fine: {
                    id: Tagged.generate('fine'),
                    reason: `Test Fine ${i}`,
                    value: Math.random() < 0.5 ? FineValue.amount(new Amount(i, 0)) : FineValue.item('crateOfBeer', i),
                    date: UtcDate.now,
                    payedState: Math.random() < 0.5 ? 'payed' : 'notPayed'
                }
            });
        }
    }

    public async createTestData() {
        if (isProduction)
            return;
        if (this.userManager.signedInUser === null || this.userManager.currentTeamId === null)
            return;
        const teamId = this.userManager.currentTeamId;
        const personId = this.userManager.signedInUser.teams.get(teamId)!.personId;
        const personIds = await this.createTestPersons(teamId, personId);
        await this.createTestFineTemplates(teamId);
        await this.createTestFines(teamId, personIds);
    }
}
