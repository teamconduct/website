import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TeamId } from '../../../types/Team';
import { Person } from '../../../types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { markAllAsDirty } from '../../../../utils/markAllAsDirty';
import { Tagged } from '../../../types/Tagged';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-person-add-edit',
    standalone: true,
    imports: [DialogModule, ReactiveFormsModule, FloatLabelModule, InputTextModule, ButtonModule],
    templateUrl: './person-add-edit.component.html',
    styleUrl: './person-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonAddEditComponent implements OnInit {

    @Input({ required: true }) public teamId!: TeamId;

    @Input() public person: Omit<Person, 'fineIds' | 'signInProperties'> | null = null;

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public state: 'error' | 'loading' | null = null;

    public personForm = new FormGroup({
        firstName: new FormControl<string | null>(null, [Validators.required]),
        lastName: new FormControl<string | null>(null, [])
    });

    public ngOnInit() {
        if (this.person) {
            this.personForm.setValue({
                firstName: this.person.properties.firstName,
                lastName: this.person.properties.lastName
            });
        }
    }

    public async addOrUpdatePerson(functionKey: 'add' | 'update') {
        if (this.state === 'loading')
            return;
        markAllAsDirty(this.personForm);
        if (this.personForm.invalid) {
            this.state = 'error';
            return;
        }
        this.state = 'loading';

        await this.firebaseFunctions.function('person').function(functionKey).call({
            teamId: this.teamId,
            person: {
                id: this.person === null ? Tagged.generate('person') : this.person.id,
                properties: {
                    firstName: this.personForm.get('firstName')!.value!,
                    lastName: this.personForm.get('lastName')!.value
                }
            }
        });

        this.personForm.reset();
        this.state = null;
        this.visibleChange.emit(false);
    }
}
