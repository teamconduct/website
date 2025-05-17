import { Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Tag, TagModule } from 'primeng/tag';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { DatePipe } from '../../../pipes/date.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FineAmountPipe } from '../../../pipes/fineAmount.pipe';
import { FineDetailAddEditComponent } from '../fine-detail-add-edit/fine-detail-add-edit.component';
import { SkeletonModule } from 'primeng/skeleton';
import { AsyncPipe } from '@angular/common';
import { configuration } from '../../../../environments/environment';
import { Fine, PayedState, Person } from '@stevenkellner/team-conduct-api';

@Component({
    selector: 'app-fines-list-element',
    standalone: true,
    imports: [FineAmountPipe, DatePipe, TagModule, FontAwesomeModule, FineDetailAddEditComponent, SkeletonModule, AsyncPipe],
    templateUrl: './fines-list-element.component.html',
    styleUrl: './fines-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinesListElementComponent {

    @Input({ required: true }) public personId!: Person.Id | null;

    @Input({ required: true }) public fine!: Fine | null;

    @Input() public hideTopBorder: boolean = false;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private changeDetector = inject(ChangeDetectorRef);

    public loading: boolean = false;

    public detailsShown: boolean = false;

    public get canChangeFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get payedTag(): { value: string, severity: Tag['severity'] } | null {
        if (this.fine === null)
            return null;
        return PayedState.payedTag(this.fine.payedState);
    }

    public async toggleFineState() {
        if (this.loading || this.personId === null || this.fine === null)
            return;
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return;
        this.loading = true;
        await this.firebaseFunctions.functions.fine.update.execute({
            teamId: selectedTeamId,
            personId: this.personId,
            fine: new Fine(
                this.fine.id,
                PayedState.toggled(this.fine.payedState),
                this.fine.date,
                this.fine.reason,
                this.fine.amount
            ),
            configuration: configuration
        }).finally(() => {
            this.loading = false;
            this.changeDetector.markForCheck();
        });
    }
}
