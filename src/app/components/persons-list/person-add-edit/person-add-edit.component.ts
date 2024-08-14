import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Person, UserRole } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { Tagged } from '../../../types/Tagged';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { Observable } from '../../../types/Observable';
import { ButtonModule } from 'primeng/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AsyncPipe } from '../../../pipes/async.pipe';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
    selector: 'app-person-add-edit',
    standalone: true,
    imports: [AddEditFormDialogComponent, FormElementComponent, ButtonModule, FontAwesomeModule, AsyncPipe, ToggleButtonModule],
    templateUrl: './person-add-edit.component.html',
    styleUrl: './person-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonAddEditComponent extends SubmitableForm<{
    firstName: FormControl<string | null>
    lastName: FormControl<string | null>
}, 'no-team-id'> {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input() public person: Omit<Person, 'fineIds'> | null = null;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public userRoleChangerVisible = false;

    private selectedUserRoles: UserRole[] | null = null;

    public constructor() {
        super({
            firstName: new FormControl<string | null>(null, [Validators.required]),
            lastName: new FormControl<string | null>(null, [])
        }, {
            'no-team-id': $localize `:Error message that no team ID is set:Cannot assiciate the person with a team`
        });
    }

    public get userRoleButtons$(): Observable<{ role: UserRole, label: string, selected: boolean, disabled: boolean }[] | null> {
        return this.userManager.currentPersonId$.map(currentPersonId => {
            const person = this.person;
            const selectedUserRoles = this.selectedUserRoles;
            if (person === null || selectedUserRoles === null ||currentPersonId === null)
                return null;
            return UserRole.all.map(role => ({
                role: role,
                label: UserRole.description(role),
                selected: selectedUserRoles.includes(role),
                disabled: role === 'team-manager' && person.id.guidString === currentPersonId.guidString
            }));
        });
    }

    public toggleUserRole(role: UserRole) {
        if (this.selectedUserRoles === null)
            return;
        if (this.selectedUserRoles.includes(role))
            this.selectedUserRoles = this.selectedUserRoles.filter(r => r !== role);
        else
            this.selectedUserRoles.push(role);
    }

    public get userRolesChanged(): boolean {
        if (this.person === null || this.person.signInProperties === null || this.selectedUserRoles === null)
            return false;
        for (const role of UserRole.all) {
            if (this.selectedUserRoles.includes(role) !== this.person.signInProperties.roles.includes(role))
                return true;
        }
        return false;
    }

    public get userRoleChangerVisibleButtonLabel(): string {
        if (this.userRoleChangerVisible)
            return $localize `:Button label to hide user role changer:Hide user roles`;
        if (this.userRolesChanged)
            return $localize `:Button label to show user role changer with changes:Edit user roles (some are changed)`;
        return $localize `:Button label to show user role changer without changes:Edit user roles`;
    }

    public get headerLabel(): string {
        if (this.person === null)
            return $localize `:Header label for adding a person:Add a new person`;
        return $localize `:Header label for editing a person:Edit ${Person.name(this.person)}`;
    }

    public get buttonLabel(): string {
        if (this.person === null)
            return $localize `:Button label to add person:Add person`;
        return $localize `:Button label to save person:Save person`;
    }

    public override reset() {
        this.userRoleChangerVisible = false;
        this.selectedUserRoles = null;
        if (this.person !== null && this.person.signInProperties !== null)
            this.selectedUserRoles = [...this.person.signInProperties.roles];
        super.reset();
        if (this.person === null)
            return;
        this.setValue({
            firstName: this.person.properties.firstName,
            lastName: this.person.properties.lastName
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';
        await this.firebaseFunctions.function('person').function(this.person === null ? 'add' : 'update').call({
            teamId: selectedTeamId,
            person: {
                id: this.person !== null ? this.person.id : Tagged.generate('person'),
                properties: {
                    firstName: this.get('firstName')!.value!,
                    lastName: this.get('lastName')!.value
                }
            }
        });
        if (this.person !== null && this.selectedUserRoles !== null) {
            await this.firebaseFunctions.function('user').function('roleEdit').call({
                teamId: selectedTeamId,
                personId: this.person.id,
                roles: this.selectedUserRoles
            });
        }
    }
}
