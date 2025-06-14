import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FineDetailComponent } from '../fine/fine-detail/fine-detail.component';
import { FineAddEditComponent } from '../fine/fine-add-edit/fine-add-edit.component';
import { FineTemplateDetailComponent } from '../fine-template/fine-template-detail/fine-template-detail.component';
import { FineTemplateAddEditComponent } from '../fine-template/fine-template-add-edit/fine-template-add-edit.component';
import { PersonAddEditComponent } from '../person/person-add-edit/person-add-edit.component';
import { PaypalMeAddEditComponent } from '../paypal-me-add-edit/paypal-me-add-edit.component';

@Component({
    selector: 'app-popup-dialog-handler',
    imports: [NgTemplateOutlet, AsyncPipe, DialogModule, PersonAddEditComponent, FineDetailComponent, FineAddEditComponent, FineTemplateDetailComponent, FineTemplateAddEditComponent, PaypalMeAddEditComponent],
    templateUrl: './popup-dialog-handler.component.html',
    styleUrl: './popup-dialog-handler.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupDialogHandlerComponent {

    public popupDialogHandler = inject(PopupDialogHandlerService);

    public closeTimeoutActive: boolean = false;

    public visibleChanged(visible: boolean) {
        if (!visible) {
            this.popupDialogHandler.closeDialog();
            this.closeTimeoutActive = true;
            setTimeout(() => {
                this.closeTimeoutActive = false;
            }, 100);
        }
    }
}
