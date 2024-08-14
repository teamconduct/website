import { Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FineValuePipe } from '../../../pipes/fineValue.pipe';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { FineTemplate, FineTemplateMultiple } from '../../../types';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { AsyncPipe } from '../../../pipes/async.pipe';

@Component({
    selector: 'app-fine-template-detail',
    standalone: true,
    imports: [FineValuePipe, ButtonModule, ConfirmPopupModule, AsyncPipe],
    providers: [ConfirmationService],
    templateUrl: './fine-template-detail.component.html',
    styleUrl: './fine-template-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplateDetailComponent {

    @Input({ required: true }) public fineTemplate!: FineTemplate;

    @Output() public readonly editFineTemplate = new EventEmitter<void>();

    @Output() public readonly fineTemplateDeleted = new EventEmitter<void>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private confirmationService = inject(ConfirmationService);

    public deleteLoading: boolean = false;

    public get canEditFineTemplate$(): Observable<boolean> {
        return this.userManager.hasRole('fineTemplate-manager');
    }

    public get canDeleteFineTemplate$(): Observable<boolean> {
        return this.userManager.hasRole('fineTemplate-manager');
    }

    public multipleDescription(multiple: Exclude<FineTemplate['multiple'], null>): string {
        return FineTemplateMultiple.description(multiple);
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

        await this.firebaseFunctions.function('fineTemplate').function('delete').call({
            teamId: selectedTeamId,
            id: this.fineTemplate.id
        });

        this.deleteLoading = false;
        this.fineTemplateDeleted.emit();
    }
}
