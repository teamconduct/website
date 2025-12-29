import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../services/firebase-functions/firebase-functions.service';
import { UserManagerService } from '../../services/user-manager/user-manager.service';
import { RandomDataGeneratorService } from '../../services/random-data-generator/random-data-generator.service';
import { Router } from '@angular/router';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { PersonPrivateProperties, Team } from '@stevenkellner/team-conduct-api';
import { isProduction } from '../../../environments/environment';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ErrorMessageComponent } from '../../components/error-message/error-message.component';
import { FloatLabelModule } from 'primeng/floatlabel';
import { routeNames } from '../../app.routes';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'page-create-team',
    imports: [ReactiveFormsModule, ButtonModule, InputTextModule, ErrorMessageComponent, FloatLabelModule],
    templateUrl: './create-team.page.html',
    styleUrl: './create-team.page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTeamPage implements OnInit {

    public createTeamState: 'loading' | 'validation-failed' | 'team-create-failed'| 'navigation-failed' | null = null;

    public teamForm = new FormGroup({
        name: new FormControl<string | null>(null, [Validators.required]),
        personFirstName: new FormControl<string | null>(null, [Validators.required]),
        personLastName: new FormControl<string | null>(null)
    });

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private userManager = inject(UserManagerService);

    private randomDataGenerator = inject(RandomDataGeneratorService);

    private changeDetectorRef = inject(ChangeDetectorRef);

    private router = inject(Router);

    private titleService = inject(Title);

    public ngOnInit() {
        this.titleService.setTitle($localize `:Title for the create team page:Create Team`);
    }

    public async createTeam() {
        if (this.createTeamState === 'loading')
            return;
        this.teamForm.markAllAsDirty();
        if (this.teamForm.invalid) {
            this.createTeamState = 'validation-failed';
            return;
        }
        this.createTeamState = 'loading';

        try {
            const teamId: Team.Id = Tagged.generate('team');
            const user = await this.firebaseFunctions.functions.team.new.execute({
                id: teamId,
                name: this.teamForm.get('name')!.value!,
                paypalMeLink: null,
                personId: Tagged.generate('person'),
                personProperties: new PersonPrivateProperties(this.teamForm.get('personFirstName')!.value!, this.teamForm.get('personLastName')!.value)
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

        const navigationSuccessful = await this.router.navigate([`/${routeNames.home}`]);
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
