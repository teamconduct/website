import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Fine, PersonId } from '../../types';
import { DataViewModule } from 'primeng/dataview';
import { FinesListElementComponent } from './fines-list-element/fines-list-element.component';

@Component({
    selector: 'app-fines-list',
    standalone: true,
    imports: [DataViewModule, FinesListElementComponent],
    templateUrl: './fines-list.component.html',
    styleUrl: './fines-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListComponent {

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true, alias: 'fines' }) public _fines!: Fine[];

    @Input() public maxFines: number | null = null;

    public get fines(): Fine[] {
        return this._fines.slice(0, this.maxFines ?? undefined);
    }

    public finesType(value: any): Fine[] {
        return value;
    }
}
