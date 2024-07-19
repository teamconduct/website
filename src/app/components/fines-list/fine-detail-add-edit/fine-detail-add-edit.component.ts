import { DialogModule } from 'primeng/dialog';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Tag, TagModule } from 'primeng/tag';
import { FineDetailComponent } from '../fine-detail/fine-detail.component';
import { Fine, FineTemplate, PayedState, PersonId } from '../../../types';
import { FineAddEditComponent } from '../fine-add-edit/fine-add-edit.component';
import { TeamId } from '../../../types/Team';

@Component({
    selector: 'app-fine-detail-add-edit',
    standalone: true,
    imports: [DialogModule, TagModule, FineDetailComponent, FineAddEditComponent],
    templateUrl: './fine-detail-add-edit.component.html',
    styleUrl: './fine-detail-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineDetailAddEditComponent implements OnChanges {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true }) public fineTemplates!: FineTemplate[];

    @Input() public fine: Fine | null = null;

    public state: 'detail' | 'edit' = 'detail';

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && changes['visible'].currentValue === true)
            this.state = 'detail';
    }

    public payedTag(state: PayedState): { value: string, severity: Tag['severity'] } {
        return PayedState.payedTag(state);
    }

    public setState(state: FineDetailAddEditComponent['state']) {
        this.state = state;
    }
}
