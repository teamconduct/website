import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FineDetailAddEditComponent } from '../fines-list/fine-detail-add-edit/fine-detail-add-edit.component';
import { PaypalMeAddEditComponent } from '../paypal-me-add-edit/paypal-me-add-edit.component';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-popup-dialog-handler',
    standalone: true,
    imports: [FineDetailAddEditComponent, PaypalMeAddEditComponent, AsyncPipe],
    templateUrl: './popup-dialog-handler.component.html',
    styleUrl: './popup-dialog-handler.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupDialogHandlerComponent {

    public popupDialogHandler = inject(PopupDialogHandlerService);
}
