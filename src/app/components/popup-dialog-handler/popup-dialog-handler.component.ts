import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { FineDetailComponent } from '../fine/fine-detail/fine-detail.component';

@Component({
    selector: 'app-popup-dialog-handler',
    imports: [NgTemplateOutlet, AsyncPipe, DialogModule, FineDetailComponent],
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
