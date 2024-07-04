import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { enterLeaveAnimation } from '../../animations/enterLeaveAnimation';
import { markAllAsDirty } from '../../../utils/markAllAsDirty';
import { DividerModule } from 'primeng/divider';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';
import { Tagged } from '../../types/Tagged';
import { Guid } from '../../types/Guid';

@Component({
    selector: 'app-create-team-or-register-invitation',
    standalone: true,
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule, ErrorMessageComponent, FloatLabelModule, DividerModule],
    templateUrl: './create-team-or-register-invitation.page.html',
    styleUrl: './create-team-or-register-invitation.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class CreateTeamOrRegisterInvitationPage {

    public createTeamState: 'loading' | 'validation-failed' | 'team-create-failed' | null = null;

    public registerWithInvitationState: 'loading' | 'validation-failed' | null = null;

    public teamForm = new FormGroup({
        name: new FormControl<string | null>(null, [Validators.required]),
        personFirstName: new FormControl<string | null>(null, [Validators.required]),
        personLastName: new FormControl<string | null>(null)
    });

    private inviationIdRegex = new RegExp($localize `:Pattern to get the invitation id from link or plain id, must be in named group id:^(?:(?:https:\/\/)?(?:www\.)?teamconduct\.com\/invitation\/)?(?<id>[0-9a-fA-F]{12})$`);

    public invitationForm = new FormGroup({
        linkOrCode: new FormControl<string | null>(null, [Validators.required, Validators.pattern(this.inviationIdRegex)])
    });

    private firebaseFunctionsService = inject(FirebaseFunctionsService);

    private changeDetectorRef = inject(ChangeDetectorRef);

    public async createTeam() {
        if (this.createTeamState === 'loading')
            return;
        markAllAsDirty(this.teamForm);
        if (this.teamForm.invalid) {
            this.createTeamState = 'validation-failed';
            return;
        }
        this.createTeamState = 'loading';

        try {
            await this.firebaseFunctionsService.function('team').function('new').call({
                id: new Tagged(Guid.generate(), 'team'),
                name: this.teamForm.get('name')!.value!,
                paypalMeLink: null,
                personId: new Tagged(Guid.generate(), 'person'),
                personProperties: {
                    firstName: this.teamForm.get('personFirstName')!.value!,
                    lastName: this.teamForm.get('personLastName')!.value
                }
            });
        } catch {
            this.createTeamState = 'team-create-failed';
            this.changeDetectorRef.markForCheck();
            return;
        }

        // TODO redirect

        this.teamForm.reset();
        this.createTeamState = null;
        this.changeDetectorRef.markForCheck();
    }

    public async registerWithInvitation() {
        if (this.registerWithInvitationState === 'loading')
            return;
        markAllAsDirty(this.invitationForm);
        if (this.invitationForm.invalid) {
            this.registerWithInvitationState = 'validation-failed';
            return;
        }
        this.registerWithInvitationState = 'loading';

        // TODO

        this.invitationForm.reset();
        this.registerWithInvitationState = null;
        this.changeDetectorRef.markForCheck();
    }

    public get teamFormNameErrorMessage(): string | null {
        if (!this.teamForm.get('name')!.invalid || !this.teamForm.get('name')!.dirty)
            return null;
        if (this.teamForm.get('name')!.hasError('required'))
            return $localize `:Name is required error message of the name input field:Name is required to create a team`;
        return null;
    }

    public get teamFormFirstNameErrorMessage(): string | null {
        if (!this.teamForm.get('personFirstName')!.invalid || !this.teamForm.get('personFirstName')!.dirty)
            return null;
        if (this.teamForm.get('personFirstName')!.hasError('required'))
            return $localize `:First name is required error message of the first name input field:First name is required to create a team`;
        return null;
    }

    public get teamFormLastNameErrorMessage(): string | null {
        if (!this.teamForm.get('personLastName')!.invalid || !this.teamForm.get('personLastName')!.dirty)
            return null;
        return null;
    }

    public get createTeamErrorMessage(): string | null {
        if (this.createTeamState === null || this.createTeamState === 'loading')
            return null;
        if (this.createTeamState === 'validation-failed')
            return $localize `:Validation failed error message of the create team button:Please fill in all required fields`;
        if (this.createTeamState === 'team-create-failed')
            return $localize `:Team create failed error message of the create team button:Failed to create team`;
        return null;
    }

    public get invitationFormLinkOrCodeErrorMessage(): string | null {
        if (!this.invitationForm.get('linkOrCode')!.invalid || !this.invitationForm.get('linkOrCode')!.dirty)
            return null;
        if (this.invitationForm.get('linkOrCode')!.hasError('required'))
            return $localize `:Link or code is required error message of the link or code input field:Link or code is required to register an invitation`;
        if (this.invitationForm.get('linkOrCode')!.hasError('pattern'))
            return $localize `:Invalid link or code error message of the link or code input field:Invalid link or code`;
        return null;
    }

    public get registerWithInvitationErrorMessage(): string | null {
        if (this.registerWithInvitationState === null || this.registerWithInvitationState === 'loading')
            return null;
        if (this.registerWithInvitationState === 'validation-failed')
            return $localize `:Validation failed error message of the register with invitation button:Invalid link or code`;
        return null;
    }
}
