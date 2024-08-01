import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { PersonId, Fine, Amount, FineTemplate, FineTemplateMultipleItem, PersonWithFines, Person } from '../../../types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { markAllAsDirty } from '../../../../utils/markAllAsDirty';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { Tagged } from '../../../types/Tagged';
import { UtcDate } from '../../../types/UtcDate';
import { AsyncPipe } from '../../../pipes/async.pipe';
import { DropdownModule } from 'primeng/dropdown';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { enterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { UserManagerService } from '../../../services/user-manager.service';
import { TeamDataManagerService } from '../../../services/team-data-manager.service';
import { Observable } from '../../../types/Observable';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-fine-add-edit',
    standalone: true,
    imports: [ReactiveFormsModule, InputTextModule, ButtonModule, FloatLabelModule, CalendarModule, InputNumberModule, AsyncPipe, DropdownModule, MultiSelectModule],
    providers: [AmountPipe],
    templateUrl: './fine-add-edit.component.html',
    styleUrl: './fine-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class FineAddEditComponent implements OnInit {

    @Input() public personId: PersonId | null = null;

    @Input() public fine: Fine | null = null;

    @Output() public readonly finally = new EventEmitter<void>();

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private amountPipe = inject(AmountPipe);

    public state: 'error' | 'loading' | null = null;

    public fineForm = new FormGroup({
        personIds: new FormControl<PersonId[]>([], [Validators.required]),
        fineTemplate: new FormControl<FineTemplate | 'ownFine' | null>(null, [Validators.required]),
        fineTemplateTimes: new FormControl<number>(1, []),
        reason: new FormControl<string | null>(null, []),
        amount: new FormControl<number | null>(null, []),
        date: new FormControl<Date>(new Date(), [Validators.required])
    }, { validators: control => {
        if (control.get('fineTemplate')!.value !== 'ownFine')
            return null;
        const reasonValid = control.get('reason')!.value !== null && control.get('reason')!.value !== '';
        const amountValid = control.get('amount')!.value !== null && control.get('amount')!.value !== 0;
        if (reasonValid && amountValid)
            return null;
        return {
            reasonRequired: !reasonValid,
            amountRequired: !amountValid
        };
    }});

    public ngOnInit() {
        this.fineForm.get('personIds')!.setValue(this.personId !== null ? [this.personId] : []);
        if (this.fine) {
            this.fineForm.setValue({
                personIds: this.personId !== null ? [this.personId] : [],
                fineTemplate: 'ownFine',
                fineTemplateTimes: 1,
                reason: this.fine.reason,
                amount: this.fine.amount.completeValue,
                date: this.fine.date.toDate
            });
        }
    }

    public get persons$(): Observable<PersonWithFines[]> {
        return this.teamDataManager.persons$.map(personsDict => personsDict.values);
    }

    public get fineTemplates$(): Observable<FineTemplate[]> {
        return this.teamDataManager.fineTemplates$.map(fineTemplatesDict => fineTemplatesDict.values);
    }

    public personsOptions(persons: PersonWithFines[]): { label: string, value: PersonId }[] {
        persons.sort((lhs, rhs) => {
            const lhsName = Person.name(lhs).toUpperCase();
            const rhsName = Person.name(rhs).toUpperCase();
            if (lhsName === rhsName)
                return 0;
            return lhsName < rhsName ? -1 : 1;
        });
        return persons.map(person => ({
            label: Person.name(person),
            value: person.id
        }));
    }

    public fineTemplateOptions(fineTemplates: FineTemplate[]): { label: string, value: FineTemplate | 'ownFine' }[] {
        fineTemplates.sort((lhs, rhs) => {
            const lhsReason = lhs.reason.toUpperCase();
            const rhsReason = rhs.reason.toUpperCase();
            if (lhsReason === rhsReason)
                return 0;
            return lhsReason < rhsReason ? -1 : 1;
        });
        return [
            {
                label: $localize `:Label of fine reason dropdown in add fine for own reason:Create own fine`,
                value: 'ownFine'
            },
            ...fineTemplates.map(template => ({
                label: `${template.reason} | ${this.amountPipe.transform(template.amount)}`,
                value: template
            }))
        ];
    }

    public get fineTemplateTimesMaximum(): number | null {
        const fineTemplateValue = this.fineForm.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.multiple === null)
            return -1;
        return fineTemplateValue.multiple.maxCount;
    }

    public get fineTemplateTimesSuffix(): string {
        const fineTemplateValue = this.fineForm.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.multiple === null)
            return '';
        const isPlural = this.fineForm.get('fineTemplateTimes')!.value! > 1;
        return FineTemplateMultipleItem.description(fineTemplateValue.multiple.item, 'inText', isPlural);
    }

    public async addOrUpdateFine(functionKey: 'add' | 'update') {
        if (this.userManager.currentTeamId === null)
            return;

        if (this.state === 'loading')
            return;
        markAllAsDirty(this.fineForm);
        if (this.fineForm.invalid) {
            this.state = 'error';
            return;
        }
        this.state = 'loading';

        const fineTemplateValue = this.fineForm.get('fineTemplate')!.value!;
        const reason = fineTemplateValue === 'ownFine' ? this.fineForm.get('reason')!.value! : fineTemplateValue.reason;
        const amount = fineTemplateValue === 'ownFine' ? Amount.from(this.fineForm.get('amount')!.value!) : fineTemplateValue.amount.multiplied(this.fineForm.get('fineTemplateTimes')!.value!);

        for (const personId of this.fineForm.get('personIds')!.value!) {
            await this.firebaseFunctions.function('fine').function(functionKey).call({
                teamId: this.userManager.currentTeamId,
                personId: personId,
                fine: {
                    id: this.fine === null ? Tagged.generate('fine') : this.fine.id,
                    reason: reason,
                    date: UtcDate.fromDate(this.fineForm.get('date')!.value!),
                    amount: amount,
                    payedState: this.fine === null ? 'notPayed' : this.fine.payedState
                }
            });
        }

        this.fineForm.reset();
        this.state = null;
        this.finally.emit();
    }
}
