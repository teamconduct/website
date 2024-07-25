import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { FineTemplateDetailAddEditComponent } from '../fine-template-detail-add-edit/fine-template-detail-add-edit.component';
import { FineTemplate, FineTemplateMultiple } from '../../../types';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-fine-templates-list-element',
    standalone: true,
    imports: [AmountPipe, FineTemplateDetailAddEditComponent, SkeletonModule],
    templateUrl: './fine-templates-list-element.component.html',
    styleUrl: './fine-templates-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplatesListElementComponent {

    @Input({ required: true }) public fineTemplate!: FineTemplate | null;

    @Input() public hideTopBorder: boolean = false;

    public detailsShown: boolean = false;

    public multipleDescription(multiple: Exclude<FineTemplate['multiple'], null>): string {
        return FineTemplateMultiple.description(multiple);
    }
}
