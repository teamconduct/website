import { DialogModule } from 'primeng/dialog';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Tag, TagModule } from 'primeng/tag';
import { FineDetailComponent } from '../fine-detail/fine-detail.component';
import { Fine, PayedState, PersonId } from '../../../types';
import { FineAddEditComponent } from '../fine-add-edit/fine-add-edit.component';

@Component({
    selector: 'app-fine-detail-add-edit',
    standalone: true,
    imports: [DialogModule, TagModule, FineDetailComponent, FineAddEditComponent],
    templateUrl: './fine-detail-add-edit.component.html',
    styleUrl: './fine-detail-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineDetailAddEditComponent implements OnChanges {

    @Input() public personId: PersonId | null = null;

    @Input() public fine: Fine | null = null;

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    public state: 'detail' | 'edit' = 'detail';

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && changes['visible'].currentValue === true)
            this.state = 'detail';
    }

    public payedTag(state: PayedState): { value: string, severity: Tag['severity'] } {
        return PayedState.payedTag(state);
    }
}
