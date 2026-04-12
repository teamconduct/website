import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FineAmountPipe } from '../../../../pipes/fine-amount/fine-amount.pipe';
import { Observable, SummedFineValue } from '../../../../types';
import { AppStateManagerService } from '../../../../services/app-state-manager/app-state-manager.service';
import { DataManagerService } from '../../../../services/data-manager/data-manager.service';
import { compactMap } from '@stevenkellner/typescript-common-functionality';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';
import { User } from '@stevenkellner/team-conduct-api';

export interface UserDashboardFinesStats {
    total:  SummedFineValue;
    notPayed: SummedFineValue;
    payed: SummedFineValue;
};

@Component({
    selector: 'app-user-dashboard-fines-stats',
    imports: [FineAmountPipe, FaIconComponent, AsyncPipe],
    templateUrl: './user-dashboard-fines-stats.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardFinesStatsComponent {

    public appStateManager = inject(AppStateManagerService);

    public dataManager = inject(DataManagerService);

    public readonly faFileInvoice = faFileInvoice;

    private currentFineType: keyof UserDashboardFinesStats = 'notPayed';

    public getFinesStats$(user: User): Observable<UserDashboardFinesStats> {
        return Observable.combineArray(compactMap(user.teams.values, (teamProperties => {
            const team = this.dataManager.teams.getOptional(teamProperties.teamId);
            if (team === null)
                return null;
            return team.persons$.map(persons => ({
                teamId: teamProperties.teamId,
                personId: teamProperties.personId,
                persons: persons
            }));
        })), teams => compactMap(teams, teamProperties => {
            const person = teamProperties.persons.getOptional(teamProperties.personId);
            if (person === null)
                return null;
            return person.fineValues
        })).map(finesPerTeam => finesPerTeam.reduce((acc, fineValues) => ({
            total: acc.total.added(fineValues.total),
            notPayed: acc.notPayed.added(fineValues.notPayed),
            payed: acc.payed.added(fineValues.payed)
        }), {
            total: new SummedFineValue(),
            notPayed: new SummedFineValue(),
            payed: new SummedFineValue()
        }));
    }

    public get currentFineTypeHeaderName(): string {
        switch (this.currentFineType) {
        case 'total':
            return 'Your Total fines';
        case 'notPayed':
            return 'Your Open fines';
        case 'payed':
            return 'Your Paid fines';
        }
    }

    public get currentFineTypeButtonName(): string {
        switch (this.currentFineType) {
        case 'total':
            return 'Total';
        case 'notPayed':
            return 'Not paid';
        case 'payed':
            return 'Paid';
        }
    }

    public getCurrentFineValue(finesStats: UserDashboardFinesStats): SummedFineValue {
        return finesStats[this.currentFineType];
    }

    public nextFineType() {
        switch (this.currentFineType) {
        case 'total':
            this.currentFineType = 'notPayed';
            break;
        case 'notPayed':
            this.currentFineType = 'payed';
            break;
        case 'payed':
            this.currentFineType = 'total';
            break;
        }
    }

}
