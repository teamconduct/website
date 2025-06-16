import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { SelectModule } from 'primeng/select';
import { Sorting } from '../../types';

@Component({
    selector: 'app-list-sorting',
    imports: [InputGroupModule, ButtonModule, SelectModule, FontAwesomeModule],
    templateUrl: './list-sorting.component.html',
    styleUrl: './list-sorting.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSortingComponent<Key extends string, T> {

    public readonly sorting = input.required<Sorting<Key, T>>();
}
