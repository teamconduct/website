import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Fine, Person } from '@stevenkellner/team-conduct-api';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { Observable } from '../../../types';
import { fineListSorting } from '../../../types/sorting/fine-line-sorting';
import { AsyncPipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DropdownModule } from 'primeng/dropdown';
import { FineListElementComponent } from '../fine-list-element/fine-list-element.component';

@Component({
    selector: 'app-fine-list',
    imports: [AsyncPipe, DataViewModule, ButtonModule, FontAwesomeModule, DropdownModule, FineListElementComponent],
    templateUrl: './fine-list.component.html',
    styleUrl: './fine-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineListComponent  {

    public readonly personId = input.required<Person.Id | null>();

    public readonly alwaysShowAllFines = input<boolean>(false);

    public teamDataManager = inject(TeamDataManagerService);

    public allFinesShown: boolean = false;

    public sorting = fineListSorting;

    public get fines$(): Observable<{ list: Fine[], hasMore: boolean } | null> {
        return this.teamDataManager.persons$.map(persons => {
            const personId = this.personId();
            if (personId === null || !persons.has(personId))
                return null;
            const fines = persons.get(personId).fines;
            this.sorting.sort(fines);
            return {
                list: fines.slice(0, !this.alwaysShowAllFines() && !this.allFinesShown ? 3 : undefined),
                hasMore: !this.alwaysShowAllFines() && fines.length > 3
            };
        });
    }

    public get skeletonFines(): null[] {
        return new Array(3).fill(null);
    }

    public finesType(value: any): (Fine | null)[] {
        return value;
    }
}
