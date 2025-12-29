import { PopupDialogHandlerService } from './../../../services/popup-dialog-handler/popup-dialog-handler.service';
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
import { PayedTag } from '../../../types/PayedTag';
import { ConfigurationService } from '../../../services/configuration/configuration.service';

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

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private configurationService = inject(ConfigurationService);

    public loading: boolean = false;

    public get canChangeFine$(): Observable<boolean> {
        return this.userManager.hasRole('fine-manager');
    }

    public get payedTag(): PayedTag.Formatted | null {
        const fine = this.fine();
        if (fine === null)
            return null;
        return new PayedTag(fine.payedState).toFormatted(this.configurationService.locale);
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
            configuration: this.configurationService.configuration
        }).finally(() => {
            this.loading = false;
            this.changeDetector.markForCheck();
        });
    }

    public showFineDetails() {
        const personId = this.personId();
        const fine = this.fine();
        if (personId === null || fine === null)
            return;
        this.popupDialogHandler.activate({
            type: 'fineDetail',
            personId: personId,
            fine: fine
        });
    }
}
