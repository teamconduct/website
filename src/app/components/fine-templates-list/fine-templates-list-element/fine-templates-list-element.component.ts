import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { FineTemplateDetailAddEditComponent } from '../fine-template-detail-add-edit/fine-template-detail-add-edit.component';
import { TeamId } from '../../../types/Team';
import { FineTemplate, FineTemplateMultiple } from '../../../types';

@Component({
    selector: 'app-fine-templates-list-element',
    standalone: true,
    imports: [AmountPipe, FineTemplateDetailAddEditComponent],
    templateUrl: './fine-templates-list-element.component.html',
    styleUrl: './fine-templates-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplatesListElementComponent {

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true }) public fineTemplate!: FineTemplate;

    @Input() public hideTopBorder: boolean = false;

    public detailsShown: boolean = false;

    public showDetails() {
        this.detailsShown = true;
    }

    public multipleDescription(multiple: Exclude<FineTemplate['multiple'], null>): string {
        return FineTemplateMultiple.description(multiple);
    }
}
