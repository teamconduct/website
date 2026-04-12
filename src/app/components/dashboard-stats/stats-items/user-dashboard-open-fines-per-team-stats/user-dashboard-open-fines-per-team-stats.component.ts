import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { AppStateManagerService } from '../../../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { Observable, SummedFineValue } from '../../../../types';
import { User } from '@stevenkellner/team-conduct-api';
import { compactMap } from '@stevenkellner/typescript-common-functionality';

interface TeamOpenFineStats {
    teamName: string;
    openFines: SummedFineValue;
}

@Component({
    selector: 'app-user-dashboard-open-fines-per-team-stats',
    imports: [FineAmountPipe, AsyncPipe, FaIconComponent],
    templateUrl: './user-dashboard-open-fines-per-team-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardOpenFinesPerTeamStatsComponent {

    public appStateManager = inject(AppStateManagerService);

    public dataManager = inject(DataManagerService);

    public readonly faClockRotateLeft = faClockRotateLeft;

    public getOpenFinesPerTeam$(user: User): Observable<TeamOpenFineStats[]> {
        return Observable.combineArray(compactMap(user.teams.values, (teamProperties => {
            const team = this.dataManager.teams.getOptional(teamProperties.teamId);
            if (team === null)
                return null;
            return team.persons$.map(persons => ({
                teamName: teamProperties.teamName,
                personId: teamProperties.personId,
                persons,
            }));
        })), teams => compactMap(teams, teamProperties => {
            const person = teamProperties.persons.getOptional(teamProperties.personId);
            if (person === null)
                return null;
            return {
                teamName: teamProperties.teamName,
                openFines: person.fineValues.notPayed,
            };
        }));
    }
}
