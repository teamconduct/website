import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FineTemplateDetailComponent } from '../fine-template-detail/fine-template-detail.component';
import { FineTemplateAddEditComponent } from '../fine-template-add-edit/fine-template-add-edit.component';
import { FineTemplate } from '../../../types';

@Component({
    selector: 'app-fine-template-detail-add-edit',
    standalone: true,
    imports: [DialogModule, FineTemplateDetailComponent, FineTemplateAddEditComponent],
    templateUrl: './fine-template-detail-add-edit.component.html',
    styleUrl: './fine-template-detail-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplateDetailAddEditComponent implements OnChanges {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input() public fineTemplate: FineTemplate | null = null;

    public state: 'detail' | 'edit' = 'detail';

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && changes['visible'].currentValue === true)
            this.state = 'detail';
    }
}
