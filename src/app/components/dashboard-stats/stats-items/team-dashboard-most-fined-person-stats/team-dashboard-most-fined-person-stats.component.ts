import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTrophy, faUser } from '@fortawesome/free-solid-svg-icons';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { PersonWithFines } from '../../../../types/PersonWithFines';
import { SummedFineValue } from '../../../../types';
import { Dictionary } from '@stevenkellner/typescript-common-functionality';
import { Person } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-team-dashboard-most-fined-person-stats',
    imports: [FineAmountPipe, AsyncPipe, FaIconComponent],
    templateUrl: './team-dashboard-most-fined-person-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamDashboardMostFinedPersonStatsComponent {

    public dataManager = inject(DataManagerService);

    public readonly faTrophy = faTrophy;

    public readonly faUser = faUser;

    public getMostFinedPerson(persons: Dictionary<Person.Id, PersonWithFines>): PersonWithFines | null {
        let mostFinedPerson: PersonWithFines | null = null;
        for (const person of persons.values) {
            if (mostFinedPerson === null || SummedFineValue.compare(person.fineValues.total, mostFinedPerson.fineValues.total) === 'greater')
                mostFinedPerson = person;
        }
        return mostFinedPerson;
    }
}
