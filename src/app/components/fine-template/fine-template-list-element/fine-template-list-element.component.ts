import { SkeletonModule } from 'primeng/skeleton';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FineTemplate, FineTemplateRepetition } from '@stevenkellner/team-conduct-api';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';

@Component({
    selector: 'app-fine-template-list-element',
    imports: [SkeletonModule, FineAmountPipe],
    templateUrl: './fine-template-list-element.component.html',
    styleUrl: './fine-template-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplateListElementComponent {

    public readonly fineTemplate = input.required<FineTemplate | null>();

    public readonly hideTopBorder = input<boolean>(false);

    public repetitionDescription(multiple: FineTemplateRepetition): string {
        return FineTemplateRepetition.Item.formatted(multiple.item);
    }

    public showFineTemplateDetails() {
        // TODO
    }
}
