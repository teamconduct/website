import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { AsyncPipe } from '../../pipes/async.pipe';
import { AddEditFormDialogComponent } from '../add-edit-form-dialog/add-edit-form-dialog.component';
import { FormElementComponent } from '../add-edit-form/form-element/form-element.component';
import { SubmitableForm } from '../../types/SubmitableForm';
import { FormControl } from '@angular/forms';
import { TeamDataManagerService } from '../../services/team-data-manager.service';
import { UserManagerService } from '../../services/user-manager.service';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';

@Component({
    selector: 'app-paypal-me-add-edit',
    standalone: true,
    imports: [AsyncPipe, AddEditFormDialogComponent, FormElementComponent],
    templateUrl: './paypal-me-add-edit.component.html',
    styleUrl: './paypal-me-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaypalMeAddEditComponent extends SubmitableForm<{
    link: FormControl<string | null>
}, 'no-team-id'> {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    private userManager = inject(UserManagerService);

    public teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public constructor() {
        super({
            link: new FormControl<string | null>(null)
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set:Cannot assiciate the fine with a team`
        }, control => {
            const link = control.get('link')!.value;
            if (link === null || link === '')
                return null;
            if (link.match(/^(?:https:\/\/)?(?:www\.)?paypal.me\/[a-zA-Z0-9]+$/))
                return null;
            control.get('link')!.setErrors({ pattern: true });
            return {
                linkPattern: true
            };
        });
    }

    public headerLabel(paypalMeLink: string | null): string {
        if (paypalMeLink === null)
            return  $localize `:Header label to add fine:Add PayPal.me link`;
        return $localize `:Header label to edit fine:Edit PayPal.me link`;
    }

    public buttonLabel(paypalMeLink: string | null): string {
        if (paypalMeLink === null)
            return $localize `:Button label to add fine:Add paypal.me link`;
        return $localize `:Button label to edit fine:Save paypal.me link`;
    }

    public override reset() {
        super.reset();
        this.get('link')!.setValue(this.teamDataManager.team$.value?.paypalMeLink ?? null);
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';
        const paypalMeLink = this.get('link')!.value;
        await this.firebaseFunctions.function('paypalMe').function('edit').call({
            teamId: selectedTeamId,
            paypalMeLink: paypalMeLink === null || paypalMeLink === '' ? null : (paypalMeLink.startsWith('https://') ? paypalMeLink : `https://${paypalMeLink}`)
        });
    }
}
