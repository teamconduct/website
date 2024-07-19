import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Fine, PayedState, PersonId } from '../../../types';
import { Tag, TagModule } from 'primeng/tag';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { DatePipe } from '../../../pipes/date.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { FineDetailAddEditComponent } from '../fine-detail-add-edit/fine-detail-add-edit.component';

@Component({
    selector: 'app-fines-list-element',
    standalone: true,
    imports: [AmountPipe, DatePipe, TagModule, FontAwesomeModule, FineDetailAddEditComponent],
    templateUrl: './fines-list-element.component.html',
    styleUrl: './fines-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListElementComponent {

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true }) public fine!: Fine;

    @Input() public hideTopBorder: boolean = false;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private changeDetector = inject(ChangeDetectorRef);

    public loading: boolean = false;

    public detailsShown: boolean = false;

    public get canChangeFine(): boolean {
        return this.userManager.hasRole('fine-update');
    }

    public get payedTag(): { value: string, severity: Tag['severity'] } {
        return PayedState.payedTag(this.fine.payedState);
    }

    public async toggleFineState() {
        if (this.loading)
            return;
        const teamId = this.userManager.currentTeamId;
        if (teamId === null)
            return;
        this.loading = true;
        await this.firebaseFunctions.function('fine').function('update').call({
            teamId: teamId,
            personId: this.personId,
            fine: {
                ...this.fine,
                payedState: PayedState.toggled(this.fine.payedState)
            }
        }).finally(() => {
            this.loading = false;
            this.changeDetector.markForCheck();
        });
    }
}
