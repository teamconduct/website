import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { enterLeaveAnimation } from '../../animations/enterLeaveAnimation';
import { markAllAsDirty } from '../../../utils/markAllAsDirty';
import { FirebaseFunctionsService } from '../../services/firebase-functions.service';
import { Tagged } from '../../types/Tagged';
import { Guid } from '../../types/Guid';
import { Router } from '@angular/router';
import { appRoutes } from '../../app.routes';
import { UserManagerService } from '../../services/user-manager.service';
import { TeamId } from '../../types/Team';
import { RandomDataGeneratorService } from '../../services/random-data-generator.service';
import { isProduction } from '../../../environments/environment';

@Component({
    selector: 'app-create-team',
    standalone: true,
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule, ErrorMessageComponent, FloatLabelModule],
    templateUrl: './create-team.page.html',
    styleUrl: './create-team.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class CreateTeamPage {

    public createTeamState: 'loading' | 'validation-failed' | 'team-create-failed'| 'navigation-failed' | null = null;

    public teamForm = new FormGroup({
        name: new FormControl<string | null>(null, [Validators.required]),
        personFirstName: new FormControl<string | null>(null, [Validators.required]),
        personLastName: new FormControl<string | null>(null)
    });

    private firebaseFunctionsService = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private randomDataGenerator = inject(RandomDataGeneratorService);

    private changeDetectorRef = inject(ChangeDetectorRef);

    private router = inject(Router);

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
            const teamId: TeamId = new Tagged(Guid.generate(), 'team');
            const user = await this.firebaseFunctionsService.function('team').function('new').call({
                id: teamId,
                name: this.teamForm.get('name')!.value!,
                paypalMeLink: null,
                personId: new Tagged(Guid.generate(), 'person'),
                personProperties: {
                    firstName: this.teamForm.get('personFirstName')!.value!,
                    lastName: this.teamForm.get('personLastName')!.value
                }
            });
            this.userManager.setUser(user);
            this.userManager.setTeamId(teamId);

            if (!isProduction)
                await this.randomDataGenerator.createTestData();

        } catch {
            this.createTeamState = 'team-create-failed';
            this.changeDetectorRef.markForCheck();
            return;
        }

        const navigationSuccessful = await this.router.navigate([`/${appRoutes.home}`]);
        if (!navigationSuccessful) {
            this.createTeamState = 'navigation-failed';
            this.changeDetectorRef.markForCheck();
            return;
        }

        this.teamForm.reset();
        this.createTeamState = null;
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
        switch (this.createTeamState) {
        case 'validation-failed':
            return $localize `:Validation failed error message of the create team button:Please fill in all required fields`;
        case 'team-create-failed':
            return $localize `:Team create failed error message of the create team button:Failed to create team`;
        case 'navigation-failed':
            return $localize `:Navigation failed error message of the create team button:Failed to navigate to the home page`;
        }
    }
}
