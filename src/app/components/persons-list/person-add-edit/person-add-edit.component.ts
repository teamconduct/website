import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Person } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { Tagged } from '../../../types/Tagged';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';

@Component({
    selector: 'app-person-add-edit',
    standalone: true,
    imports: [AddEditFormDialogComponent, FormElementComponent],
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

    @Input() public person: Omit<Person, 'fineIds' | 'signInProperties'> | null = null;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public constructor() {
        super({
            firstName: new FormControl<string | null>(null, [Validators.required]),
            lastName: new FormControl<string | null>(null, [])
        }, {
            'no-team-id': $localize `:Error message that no team ID is set:Cannot assiciate the person with a team`
        });
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
        super.reset();
        if (this.person === null)
            return;
        this.setValue({
            firstName: this.person.properties.firstName,
            lastName: this.person.properties.lastName
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        if (this.userManager.currentTeamId === null)
            return 'no-team-id';
        await this.firebaseFunctions.function('person').function(this.person === null ? 'add' : 'update').call({
            teamId: this.userManager.currentTeamId,
            person: {
                id: this.person !== null ? this.person.id : Tagged.generate('person'),
                properties: {
                    firstName: this.get('firstName')!.value!,
                    lastName: this.get('lastName')!.value
                }
            }
        });
    }
}
