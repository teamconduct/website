import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FineAmountPipe } from '../../../pipes/fineAmount.pipe';
import { FineTemplateDetailAddEditComponent } from '../fine-template-detail-add-edit/fine-template-detail-add-edit.component';
import { SkeletonModule } from 'primeng/skeleton';
import { FineTemplate, FineTemplateRepetition } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-fine-templates-list-element',
    standalone: true,
    imports: [FineAmountPipe, FineTemplateDetailAddEditComponent, SkeletonModule],
    templateUrl: './fine-templates-list-element.component.html',
    styleUrl: './fine-templates-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplatesListElementComponent {

    @Input({ required: true }) public fineTemplate!: FineTemplate | null;

    @Input() public hideTopBorder: boolean = false;

    public detailsShown: boolean = false;

    public repetitionDescription(multiple: FineTemplateRepetition): string {
        return FineTemplateRepetition.Item.formatted(multiple.item);
    }
}
