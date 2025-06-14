import { Observable } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { getEnterLeaveAnimation } from '../../animations/enterLeaveAnimation';
import { TeamDataManagerService } from '../../services/team-data-manager/team-data-manager.service';
import { AsyncPipe } from '@angular/common';
import { AddEditFormComponent } from '../add-edit-form/add-edit-form.component';
import { FormElementComponent } from '../add-edit-form/form-element/form-element.component';
import { SubmitableForm } from '../../types';
import { FormControl } from '@angular/forms';
import { PopupDialogHandlerService } from '../../services/popup-dialog-handler/popup-dialog-handler.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';

@Component({
    selector: 'app-paypal-me-add-edit',
    imports: [AsyncPipe, AddEditFormComponent, FormElementComponent],
    templateUrl: './paypal-me-add-edit.component.html',
    styleUrl: './paypal-me-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()],
    exportAs: 'appPaypalMeAddEdit'
})
export class PaypalMeAddEditComponent extends SubmitableForm<{
    link: FormControl<string | null>;
}, 'no-team-id'> {

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public teamDataManager = inject(TeamDataManagerService);

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public constructor() {
        super({
            link: new FormControl<string | null>(null, [])
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set in add / edit paypal.me link:Cannot associate the paypal.me link with a team`
        }, control => {
            control.get('link')!.setErrors(null);
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

    public get paypalMeLink$(): Observable<string | 'no-paypal-me-link' | null> {
        return this.teamDataManager.team$.map(team => team?.paypalMeLink ?? 'no-paypal-me-link');
    }

    public buttonLabel(paypalMeLink: string | 'no-paypal-me-link' | null): string {
        if (paypalMeLink === null || paypalMeLink === 'no-paypal-me-link')
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
        await this.firebaseFunctions.functions.paypalMe.edit.execute({
            teamId: selectedTeamId,
            paypalMeLink: paypalMeLink === null || paypalMeLink === '' ? null : (paypalMeLink.startsWith('https://') ? paypalMeLink : `https://${paypalMeLink}`)
        });
        this.popupDialogHandler.closeDialog();
    }
}
