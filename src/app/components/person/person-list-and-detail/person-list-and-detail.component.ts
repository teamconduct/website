import { ButtonModule } from 'primeng/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { PersonListComponent } from '../person-list/person-list.component';
import { PersonDetailComponent } from '../person-detail/person-detail.component';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-person-list-and-detail',
    imports: [ButtonModule, PersonListComponent, PersonDetailComponent],
    templateUrl: './person-list-and-detail.component.html',
    styleUrl: './person-list-and-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListAndDetailComponent {

    private titleService = inject(Title);

    public currentPersonSelected: PersonWithFines | null = null;

    public selectPerson(person: PersonWithFines | null) {
        this.currentPersonSelected = person;
        if (person === null)
            this.titleService.setTitle($localize `:Title for the persons page:Persons`);
        else
            this.titleService.setTitle(person.name);
    }
}
