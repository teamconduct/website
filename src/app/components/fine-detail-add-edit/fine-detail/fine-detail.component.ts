import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Fine, PersonId } from '../../../types';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { DatePipe } from '../../../pipes/date.pipe';
import { UserManagerService } from '../../../services/user-manager.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { TeamId } from '../../../types/Team';

@Component({
    selector: 'app-fine-detail',
    standalone: true,
    imports: [AmountPipe, DatePipe, ButtonModule, TagModule],
    templateUrl: './fine-detail.component.html',
    styleUrl: './fine-detail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineDetailComponent {

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true }) public fine!: Fine;

    @Output() public readonly editFine = new EventEmitter<void>();

    @Output() public readonly fineDeleted = new EventEmitter<void>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public deleteLoading: boolean = false;

    public get canEditFine(): boolean {
        return this.userManager.hasRole('fine-update');
    }

    public get canDeleteFine(): boolean {
        return this.userManager.hasRole('fine-delete');
    }

    public async deleteFine() {
        if (this.deleteLoading)
            return;
        this.deleteLoading = true;

        await this.firebaseFunctions.function('fine').function('delete').call({
            teamId: this.teamId,
            personId: this.personId,
            id: this.fine.id
        });

        this.deleteLoading = false;
        this.fineDeleted.emit();
    }
}
