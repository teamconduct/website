import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input } from '@angular/core';
import { Fine, PayedState, Person } from '@stevenkellner/team-conduct-api';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePipe } from '../../../pipes/date/date.pipe';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { Observable } from '../../../types';
import { Tag, TagModule } from 'primeng/tag';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { configuration } from '../../../../environments/environment';

@Component({
    selector: 'app-fine-list-element',
    imports: [AsyncPipe, SkeletonModule, TagModule, FontAwesomeModule, DatePipe, FineAmountPipe],
    templateUrl: './fine-list-element.component.html',
    styleUrl: './fine-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineListElementComponent {

    public readonly personId = input.required<Person.Id | null>();

    public readonly fine = input.required<Fine | null>();

    public readonly hideTopBorder = input<boolean>(false);

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private changeDetector = inject(ChangeDetectorRef);

    public detailsShown: boolean = false;

    public loading: boolean = false;

    public get canChangeFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get payedTag(): { value: string, severity: Tag['severity'] } | null {
        const fine = this.fine();
        if (fine === null)
            return null;
        return PayedState.payedTag(fine.payedState);
    }

    public async toggleFineState() {
        const personId = this.personId();
        const fine = this.fine();
        if (this.loading || personId === null || fine === null)
            return;
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return;
        this.loading = true;
        await this.firebaseFunctions.functions.fine.update.execute({
            teamId: selectedTeamId,
            personId: personId,
            fine: new Fine(
                fine.id,
                PayedState.toggled(fine.payedState),
                fine.date,
                fine.reason,
                fine.amount
            ),
            configuration: configuration
        }).finally(() => {
            this.loading = false;
            this.changeDetector.markForCheck();
        });
    }
}
