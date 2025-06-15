import { FineAmountPipe } from './../../../pipes/fine-amount/fine-amount.pipe';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { FineTemplate, FineTemplateRepetition } from '@stevenkellner/team-conduct-api';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { ConfirmationService } from 'primeng/api';
import { AsyncPipe } from '@angular/common';
import { Observable } from '../../../types';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ButtonGroupModule } from 'primeng/buttongroup';

@Component({
    selector: 'app-fine-template-detail',
    imports: [AsyncPipe, ButtonModule, ButtonGroupModule, ConfirmPopupModule, FineAmountPipe],
    providers: [ConfirmationService],
    templateUrl: './fine-template-detail.component.html',
    styleUrl: './fine-template-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'appFineTemplateDetail'
})
export class FineTemplateDetailComponent {

    public readonly fineTemplate = input.required<FineTemplate>();

    private userManager = inject(UserManagerService);

    private confirmationService = inject(ConfirmationService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public deleteLoading: boolean = false;

    public get canEditFineTemplate$(): Observable<boolean> {
        return this.userManager.hasRole('fineTemplate-manager');
    }

    public get canDeleteFineTemplate$(): Observable<boolean> {
        return this.userManager.hasRole('fineTemplate-manager');
    }

    public repetitionDescription(multiple: FineTemplateRepetition): string {
        return FineTemplateRepetition.Item.formatted(multiple.item);
    }

    public showFineTemplateEditDialog() {
        this.popupDialogHandler.activate({
            type: 'fineTemplateAddEdit',
            fineTemplate: this.fineTemplate()
        });
    }

    public showDeleteConfirmation(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: $localize `:Message to ask for confirmation before deleting fine template:Are you sure you want to delete this fine template?`,
            closeOnEscape: true,
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteFineTemplate()
        });
    }

    public async deleteFineTemplate() {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return;

        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.functions.fineTemplate.delete.execute({
            teamId: selectedTeamId,
            id: this.fineTemplate().id
        });

        this.deleteLoading = false;
        this.popupDialogHandler.closeDialog();
    }
}
