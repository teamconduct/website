import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Fine, PayedState, PersonId } from '../../../types';
import { Tag, TagModule } from 'primeng/tag';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { DatePipe } from '../../../pipes/date.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FineValuePipe } from '../../../pipes/fineValue.pipe';
import { FineDetailAddEditComponent } from '../fine-detail-add-edit/fine-detail-add-edit.component';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-fines-list-element',
    standalone: true,
    imports: [FineValuePipe, DatePipe, TagModule, FontAwesomeModule, FineDetailAddEditComponent, SkeletonModule],
    templateUrl: './fines-list-element.component.html',
    styleUrl: './fines-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListElementComponent {

    @Input({ required: true }) public personId!: PersonId | null;

    @Input({ required: true }) public fine!: Fine | null;

    @Input() public hideTopBorder: boolean = false;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private changeDetector = inject(ChangeDetectorRef);

    public loading: boolean = false;

    public detailsShown: boolean = false;

    public get canChangeFine(): boolean {
        return this.userManager.hasRole('fine-update');
    }

    public get payedTag(): { value: string, severity: Tag['severity'] } | null {
        if (this.fine === null)
            return null;
        return PayedState.payedTag(this.fine.payedState);
    }

    public async toggleFineState() {
        if (this.loading || this.personId === null || this.fine === null)
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
