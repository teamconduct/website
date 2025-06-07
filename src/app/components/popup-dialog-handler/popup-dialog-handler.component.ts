import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-popup-dialog-handler',
    imports: [AsyncPipe],
    templateUrl: './popup-dialog-handler.component.html',
    styleUrl: './popup-dialog-handler.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopupDialogHandlerComponent {

    public popupDialogHandler = inject(PopupDialogHandlerService);

}
