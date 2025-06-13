import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { Fine, PayedState, Person } from '@stevenkellner/team-conduct-api';
import { Tag, TagModule } from 'primeng/tag';
import { Observable } from '../../../types';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { DatePipe } from '../../../pipes/date/date.pipe';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { configuration } from '../../../../environments/environment';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';

@Component({
    selector: 'app-fine-detail',
    imports: [AsyncPipe, TagModule, ButtonModule, ConfirmPopupModule, DatePipe, FineAmountPipe],
    providers: [ConfirmationService],
    templateUrl: './fine-detail.component.html',
    styleUrl: './fine-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'appFineDetail'
})
export class FineDetailComponent {

    public readonly personId = input.required<Person.Id>();

    public readonly fine = input.required<Fine>();

    private userManager = inject(UserManagerService);

    private confirmationService = inject(ConfirmationService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public deleteLoading: boolean = false;

    public get payedTag(): { value: string, severity: Tag['severity'] } {
        return PayedState.payedTag(this.fine().payedState);
    }

    public get canEditFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get canDeleteFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public showFineEditDialog() {
        this.popupDialogHandler.activate({
            type: 'fineAddEdit',
            personId: this.personId(),
            fine: this.fine()
        });
    }

    public showDeleteConfirmation(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: $localize `:Message to ask for confirmation before deleting fine:Are you sure you want to delete this fine?`,
            closeOnEscape: true,
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteFine()
        });
    }

    public async deleteFine() {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return;

        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.functions.fine.delete.execute({
            teamId: selectedTeamId,
            personId: this.personId(),
            id: this.fine().id,
            configuration: configuration
        });

        this.deleteLoading = false;
        this.popupDialogHandler.closeDialog();
    }
}
