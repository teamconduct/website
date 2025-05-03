import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { PersonId, Fine, MoneyAmount, FineTemplate, FineTemplateRepetition, Person } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { Tagged } from '../../../types/Tagged';
import { UtcDate } from '../../../types/UtcDate';
import { AsyncPipe } from '../../../pipes/async.pipe';
import { FineAmountPipe } from '../../../pipes/fineAmount.pipe';
import { enterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { UserManagerService } from '../../../services/user-manager.service';
import { TeamDataManagerService } from '../../../services/team-data-manager.service';
import { Observable } from '../../../types/Observable';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { FineAmount } from '../../../types/FineAmount';
import { configuration } from '../../../../environments/environment';

@Component({
    selector: 'app-fine-add-edit',
    standalone: true,
    imports: [AsyncPipe, AddEditFormDialogComponent, FormElementComponent],
    providers: [FineAmountPipe],
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
    fineValueType: FormControl<'amount' | FineAmount.Item.Type | null>
    amount: FormControl<number | null>
    fineValueItemCount: FormControl<number | null>
    date: FormControl<Date | null>
}, 'no-team-id'> {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input() public personId: PersonId | null = null;

    @Input() public fine: Fine | null = null;

    private userManager = inject(UserManagerService);

    private teamDataManager = inject(TeamDataManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private fineAmountPipe = inject(FineAmountPipe);

    public constructor() {
        super({
            personIds: new FormControl<PersonId[] | null>(null, [Validators.required]),
            fineTemplate: new FormControl<FineTemplate | 'ownFine' | null>(null, [Validators.required]),
            fineTemplateTimes: new FormControl<number | null>(null, []),
            reason: new FormControl<string | null>(null, []),
            fineValueType: new FormControl<'amount' | FineAmount.Item.Type | null>(null, []),
            amount: new FormControl<number | null>(null, []),
            fineValueItemCount: new FormControl<number | null>(null, []),
            date: new FormControl<Date | null>(null, [Validators.required])
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set:Cannot assiciate the fine with a team`
        }, [
            control => {
                const fineTemplate = control.get('fineTemplate')!.value;
                if (fineTemplate === null || fineTemplate === 'ownFine')
                    return null;
                if (fineTemplate.repetition === null)
                    return null;
                const fineTemplateTimes = control.get('fineTemplateTimes')!.value;
                if (fineTemplateTimes !== null && fineTemplateTimes > 0)
                    return null;
                control.get('fineTemplateTimes')!.setErrors({ required: true });
                return {
                    fineTemplateTimesRequired: true
                };
            },
            control => {
                const fineTemplate = control.get('fineTemplate')!.value;
                if (fineTemplate !== 'ownFine')
                    return null;
                const reason = control.get('reason')!.value;
                const reasonValid = reason !== null && reason !== '';
                if (!reasonValid)
                    control.get('reason')!.setErrors({ required: true });
                const fineValueType = control.get('fineValueType')!.value;
                if (fineValueType === null) {
                    control.get('fineValueType')!.setErrors({ required: true });
                    return {
                        reasonRequired: !reasonValid,
                        fineValueTypeRequired: true
                    };
                }
                switch (fineValueType) {
                case 'amount': {
                    const amount = control.get('amount')!.value;
                    const amountValid = amount !== null && amount > 0;
                    if (!amountValid)
                        control.get('amount')!.setErrors({ required: true });
                    if (reasonValid && amountValid)
                        return null;
                    return {
                        reasonRequired: !reasonValid,
                        amountRequired: !amountValid
                    };
                }
                default: {
                    const fineValueItemCount = control.get('fineValueItemCount')!.value;
                    const fineValueItemCountValid = fineValueItemCount !== null && fineValueItemCount > 0;
                    if (!fineValueItemCountValid)
                        control.get('fineValueItemCount')!.setErrors({ required: true });
                    if (reasonValid && fineValueItemCountValid)
                        return null;
                    return {
                        reasonRequired: !reasonValid,
                        fineValueItemCountRequired: !fineValueItemCountValid
                    };
                }
                }
            }
        ]);
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
                    label: $localize `:Label of fine reason dropdown in add fine for own reason:Create own fine reason`,
                    key: 'ownFine'
                },
                ...fineTemplates.map(template => ({
                    label: `${template.reason} | ${this.fineAmountPipe.transform(template.amount)}`,
                    key: template
                }))
            ];
        });
    }

    public get fineTemplateTimesMaximum(): number | null {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.repetition === null)
            return -1;
        return fineTemplateValue.repetition.maxCount;
    }

    public get fineTemplateTimesSuffix(): string {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'ownFine' || fineTemplateValue.repetition === null)
            return '';
        const isPlural = this.get('fineTemplateTimes')!.value! > 1;
        return FineTemplateRepetition.Item.description(fineTemplateValue.repetition.item, 'inText', isPlural);
    }

    public get fineValueTypeOptions(): { label: string, key: 'amount' | FineAmount.Item.Type }[] {
        return [
            {
                label: $localize `:Fine value type selection, amount:Amount`,
                key: 'amount'
            },
            ...FineAmount.Item.Type.all.map(item => ({
                label: FineAmount.Item.Type.description(item),
                key: item
            }))
        ];
    }

    public get fineValueItemCountSuffix(): string {
        const fineValueType = this.get('fineValueType')!.value;
        if (fineValueType === null || fineValueType === 'amount')
            return '';
        const count = this.get('fineValueItemCount')!.value;
        return FineAmount.Item.Type.description(fineValueType, count !== 1);
    }

    public override reset() {
        super.reset();
        this.get('personIds')!.setValue(this.personId !== null ? [this.personId] : []);
        this.get('fineTemplateTimes')!.setValue(1);
        this.get('date')!.setValue(new Date());
        this.get('fineValueType')!.setValue('amount');
        this.get('fineValueItemCount')!.setValue(1);
        if (this.fine === null)
            return;
        this.setValue({
            personIds: this.personId !== null ? [this.personId] : [],
            fineTemplate: 'ownFine',
            fineTemplateTimes: 1,
            reason: this.fine.reason,
            fineValueType: this.fine.amount instanceof FineAmount.Money ? 'amount' : this.fine.amount.item,
            amount: this.fine.amount instanceof FineAmount.Money ? this.fine.amount.amount.completeValue : null,
            fineValueItemCount: this.fine.amount instanceof FineAmount.Item ? this.fine.amount.count : 1,
            date: this.fine.date.toDate
        });
    }

    private get fineTemplate(): { reason: string, value: FineAmount } {
        const fineTemplateValue = this.get('fineTemplate')!.value!;
        if (fineTemplateValue !== 'ownFine') {
            return {
                reason: fineTemplateValue.reason,
                value: FineAmount.multiply(fineTemplateValue.amount, this.get('fineTemplateTimes')!.value!)
            };
        }
        let value: FineAmount;
        const fineValueType = this.get('fineValueType')!.value!;
        switch (fineValueType) {
        case 'amount':
            value = FineAmount.money(MoneyAmount.from(this.get('amount')!.value!));
            break;
        default:
            value = FineAmount.item(fineValueType, this.get('fineValueItemCount')!.value!);
            break;
        }
        return {
            reason: this.get('reason')!.value!,
            value: value
        };
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';

        const personIds = this.get('personIds')!.value!;
        const fineTemplate = this.fineTemplate;
        await Promise.all(personIds.map(async personId => {
            await this.firebaseFunctions.function('fine').function(this.fine === null ? 'add' : 'update').call({
                teamId: selectedTeamId,
                personId: personId,
                fine: {
                    id: this.fine === null ? Tagged.generate('fine') : this.fine.id,
                    reason: fineTemplate.reason,
                    amount: fineTemplate.value,
                    date: UtcDate.fromDate(this.get('date')!.value!),
                    payedState: this.fine === null ? 'notPayed' : this.fine.payedState
                },
                configuration: configuration
            });
        }));
    }
}
