import { ButtonModule } from 'primeng/button';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { PersonListComponent } from '../person-list/person-list.component';
import { PersonDetailComponent } from '../person-detail/person-detail.component';

@Component({
    selector: 'app-person-list-and-detail',
    imports: [ButtonModule, PersonListComponent, PersonDetailComponent],
    templateUrl: './person-list-and-detail.component.html',
    styleUrl: './person-list-and-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListAndDetailComponent {

    public currentPersonSelected: PersonWithFines | null = null;
}
