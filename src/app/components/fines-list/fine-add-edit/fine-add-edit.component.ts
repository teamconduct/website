import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PersonId, Fine, Amount, FineTemplate, FineTemplateMultipleItem, Person } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { Tagged } from '../../../types/Tagged';
import { UtcDate } from '../../../types/UtcDate';
import { AsyncPipe } from '../../../pipes/async.pipe';
import { AmountPipe } from '../../../pipes/amount.pipe';
import { enterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { UserManagerService } from '../../../services/user-manager.service';
import { TeamDataManagerService } from '../../../services/team-data-manager.service';
import { Observable } from '../../../types/Observable';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';

@Component({
    selector: 'app-fine-add-edit',
    standalone: true,
    imports: [AsyncPipe, AddEditFormDialogComponent, FormElementComponent],
    providers: [AmountPipe],
    templateUrl: './fine-add-edit.component.html',
    styleUrl: './fine-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class FineAddEditComponent extends SubmitableForm<{
    personIds: FormControl<PersonId[] | null>
    fineTemplate: FormControl<FineTemplate | 'ownFine' | null>
    fineTemplateTimes: FormControl<number | null>
    reason: FormControl<string | null>
    amount: FormControl<number | null>
    date: FormControl<Date | null>
}, 'no-team-id'> {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input() public personId: PersonId | null = null;

    @Input() public fine: Fine | null = null;

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private amountPipe = inject(AmountPipe);

    public constructor() {
        super({
            personIds: new FormControl<PersonId[] | null>(null, [Validators.required]),
            fineTemplate: new FormControl<FineTemplate | 'ownFine' | null>(null, [Validators.required]),
            fineTemplateTimes: new FormControl<number | null>(null, []),
            reason: new FormControl<string | null>(null, []),
            amount: new FormControl<number | null>(null, []),
            date: new FormControl<Date | null>(null, [Validators.required])
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set:Cannot assiciate the fine with a team`
        }, control => {
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
        });
    }

    public get headerLabel(): string {
        if (this.fine === null)
            return $localize `:Header label for adding a fine:Add a new fine`;
        return $localize `:Header label for editing a fine:Edit ${this.fine.reason}`;
    }

    public get buttonLabel(): string {
        if (this.fine === null)
            return $localize `:Button label to add fine:Add fine`;
        return $localize `:Button label to save fine:Save fine`;
    }
    public get personOptions$(): Observable<{ label: string, key: PersonId }[]> {
        return this.teamDataManager.persons$.map(personsDict => {
            const persons = personsDict.values;
            persons.sort((lhs, rhs) => {
                const lhsName = Person.name(lhs).toUpperCase();
                const rhsName = Person.name(rhs).toUpperCase();
                if (lhsName === rhsName)
                    return 0;
                return lhsName < rhsName ? -1 : 1;
            });
            return persons.map(person => ({
                label: Person.name(person),
                key: person.id
            }));
        });
    }

    public get fineTemplateOptions$(): Observable<{ label: string, key: FineTemplate | 'ownFine' }[]> {
        return this.teamDataManager.fineTemplates$.map(fineTemplatesDict => {
            const fineTemplates = fineTemplatesDict.values;
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
                    key: 'ownFine'
                },
                ...fineTemplates.map(template => ({
                    label: `${template.reason} | ${this.amountPipe.transform(template.amount)}`,
                    key: template
                }))
            ];
        });
    }

    public get fineTemplateTimesMaximum(): number | null {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.multiple === null)
            return -1;
        return fineTemplateValue.multiple.maxCount;
    }

    public get fineTemplateTimesSuffix(): string {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.multiple === null)
            return '';
        const isPlural = this.get('fineTemplateTimes')!.value! > 1;
        return FineTemplateMultipleItem.description(fineTemplateValue.multiple.item, 'inText', isPlural);
    }

    public override reset() {
        super.reset();
        this.get('personIds')!.setValue(this.personId !== null ? [this.personId] : []);
        this.get('fineTemplateTimes')!.setValue(1);
        this.get('date')!.setValue(new Date());
        if (this.fine === null)
            return;
        this.setValue({
            personIds: this.personId !== null ? [this.personId] : [],
            fineTemplate: 'ownFine',
            fineTemplateTimes: 1,
            reason: this.fine.reason,
            amount: this.fine.amount.completeValue,
            date: this.fine.date.toDate
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        if (this.userManager.currentTeamId === null)
            return 'no-team-id';

        const fineTemplateValue = this.get('fineTemplate')!.value!;
        const reason = fineTemplateValue === 'ownFine' ? this.get('reason')!.value! : fineTemplateValue.reason;
        const amount = fineTemplateValue === 'ownFine' ? Amount.from(this.get('amount')!.value!) : fineTemplateValue.amount.multiplied(this.get('fineTemplateTimes')!.value!);

        const personIds = this.get('personIds')!.value!;
        await Promise.all(personIds.map(async personId => {
            if (this.userManager.currentTeamId === null)
                return;
            await this.firebaseFunctions.function('fine').function(this.fine === null ? 'add' : 'update').call({
                teamId: this.userManager.currentTeamId,
                personId: personId,
                fine: {
                    id: this.fine === null ? Tagged.generate('fine') : this.fine.id,
                    reason: reason,
                    date: UtcDate.fromDate(this.get('date')!.value!),
                    amount: amount,
                    payedState: this.fine === null ? 'notPayed' : this.fine.payedState
                }
            });
        }));
    }
}
