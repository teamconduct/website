import { Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Fine, PersonId } from '../../../types';
import { FineValuePipe } from '../../../pipes/fineValue.pipe';
import { DatePipe } from '../../../pipes/date.pipe';
import { UserManagerService } from '../../../services/user-manager.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { AsyncPipe } from '../../../pipes/async.pipe';

@Component({
    selector: 'app-fine-detail',
    standalone: true,
    imports: [FineValuePipe, DatePipe, ButtonModule, TagModule, ConfirmPopupModule, AsyncPipe],
    providers: [ConfirmationService],
    templateUrl: './fine-detail.component.html',
    styleUrl: './fine-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineDetailComponent {

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true }) public fine!: Fine;

    @Output() public readonly editFine = new EventEmitter<void>();

    @Output() public readonly fineDeleted = new EventEmitter<void>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private confirmationService = inject(ConfirmationService);

    public deleteLoading: boolean = false;

    public get canEditFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get canDeleteFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
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

        await this.firebaseFunctions.function('fine').function('delete').call({
            teamId: selectedTeamId,
            personId: this.personId,
            id: this.fine.id
        });

        this.deleteLoading = false;
        this.fineDeleted.emit();
    }
}
