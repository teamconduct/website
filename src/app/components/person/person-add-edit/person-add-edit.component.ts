import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ButtonModule } from 'primeng/button';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { getEnterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { AddEditFormComponent } from '../../add-edit-form/add-edit-form.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { Person, PersonPrivateProperties, UserRole } from '@stevenkellner/team-conduct-api';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { Observable, SubmitableForm } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-person-add-edit',
    imports: [AsyncPipe, ButtonModule, FontAwesomeModule, AddEditFormComponent, FormElementComponent],
    templateUrl: './person-add-edit.component.html',
    styleUrl: './person-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()],
    exportAs: 'appPersonAddEdit'
})
export class PersonAddEditComponent extends SubmitableForm<{
    firstName: FormControl<string | null>,
    lastName: FormControl<string | null>,
}, 'no-team-id'> {

    public readonly person = input.required<Person | null>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public userRoleChangerVisible = false;

    private selectedUserRoles: UserRole[] | null = null;

    public constructor() {
        super({
            firstName: new FormControl<string | null>(null, [Validators.required]),
            lastName: new FormControl<string | null>(null, [])
        }, {
            'no-team-id': $localize `:Error message that no team ID is set in add / edit person:Cannot assiciate the person with a team`
        });
    }

    public get buttonLabel(): string {
        if (this.person() === null)
            return $localize `:Button label to add person:Add person`;
        return $localize `:Button label to save person:Save person`;
    }

    public get userRoleButtons$(): Observable<{ role: UserRole, label: string, selected: boolean, disabled: boolean }[] | null> {
        return this.userManager.currentPersonId$.map(currentPersonId => {
            const person = this.person();
            const selectedUserRoles = this.selectedUserRoles;
            if (person === null || selectedUserRoles === null ||currentPersonId === null)
                return null;
            return UserRole.all.map(role => ({
                role: role,
                label: UserRole.formatted(role),
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
        const person = this.person();
        if (person === null || person.signInProperties === null || this.selectedUserRoles === null)
            return false;
        for (const role of UserRole.all) {
            if (this.selectedUserRoles.includes(role) !== person.signInProperties.roles.includes(role))
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

    public override reset() {
        this.userRoleChangerVisible = false;
        this.selectedUserRoles = null;
        const person = this.person();
        if (person !== null && person.signInProperties !== null)
            this.selectedUserRoles = [...person.signInProperties.roles];
        super.reset();
        if (person === null)
            return;
        this.setValue({
            firstName: person.properties.firstName,
            lastName: person.properties.lastName
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';
        const person = this.person();
        const addOrUpdateFunction = person === null ? this.firebaseFunctions.functions.person.add : this.firebaseFunctions.functions.person.update;
        await addOrUpdateFunction.execute({
            teamId: selectedTeamId,
            id: person !== null ? person.id : Tagged.generate('person'),
            properties: new PersonPrivateProperties(this.get('firstName')!.value!, this.get('lastName')!.value)
        });
        if (person !== null && this.selectedUserRoles !== null) {
            await this.firebaseFunctions.functions.user.roleEdit.execute({
                teamId: selectedTeamId,
                personId: person.id,
                roles: this.selectedUserRoles
            });
        }
        this.popupDialogHandler.closeDialog();
    }
}
