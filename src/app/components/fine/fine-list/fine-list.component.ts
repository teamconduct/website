import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Fine, Person } from '@stevenkellner/team-conduct-api';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { Observable } from '../../../types';
import { fineListSorting } from '../../../types/sorting/fine-list-sorting';
import { AsyncPipe } from '@angular/common';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FineListElementComponent } from '../fine-list-element/fine-list-element.component';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { ListSortingComponent } from '../../list-sorting/list-sorting.component';

@Component({
    selector: 'app-fine-list',
    imports: [AsyncPipe, DataViewModule, ButtonModule, InputGroupModule, FontAwesomeModule, SelectModule, FineListElementComponent, ListSortingComponent],
    templateUrl: './fine-list.component.html',
    styleUrl: './fine-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineListComponent  {

    public readonly personId = input.required<Person.Id | null>();

    public teamDataManager = inject(TeamDataManagerService);

    public sorting = fineListSorting;

    public get fines$(): Observable<Fine[] | null> {
        return this.teamDataManager.persons$.map(persons => {
            const personId = this.personId();
            if (personId === null || !persons.has(personId))
                return null;
            const fines = persons.get(personId).fines;
            this.sorting.sort(fines);
            return fines;
        });
    }

    public get skeletonFines(): null[] {
        return new Array(3).fill(null);
    }

    public finesType(value: any): (Fine | null)[] {
        return value;
    }
}
