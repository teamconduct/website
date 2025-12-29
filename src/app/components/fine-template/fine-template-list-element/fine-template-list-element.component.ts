import { SkeletonModule } from 'primeng/skeleton';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FineTemplate, FineTemplateRepetition } from '@stevenkellner/team-conduct-api';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { ConfigurationService } from '../../../services/configuration/configuration.service';

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

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private configurationService = inject(ConfigurationService);

    public repetitionDescription(multiple: FineTemplateRepetition): string {
        return FineTemplateRepetition.Item.formatted(multiple.item, this.configurationService.locale);
    }

    public showFineTemplateDetails() {
        const fineTemplate = this.fineTemplate();
        if (fineTemplate === null)
            return;
        this.popupDialogHandler.activate({
            type: 'fineTemplateDetail',
            fineTemplate: fineTemplate
        });
    }
}
