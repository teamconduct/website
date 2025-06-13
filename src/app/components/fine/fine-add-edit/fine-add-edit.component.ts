import { Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { Fine, FineAmount, FineTemplate, FineTemplateRepetition, MoneyAmount, Person } from '@stevenkellner/team-conduct-api';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { AsyncPipe } from '@angular/common';
import { getEnterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { SubmitableForm } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { AddEditFormComponent } from '../../add-edit-form/add-edit-form.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { configuration } from '../../../../environments/environment';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { SelectModule } from 'primeng/select';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';

@Component({
    selector: 'app-fine-add-edit',
    imports: [AsyncPipe, SelectModule, FloatLabelModule, ButtonModule, AddEditFormComponent, FormElementComponent],
    providers: [FineAmountPipe],
    templateUrl: './fine-add-edit.component.html',
    styleUrl: './fine-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [getEnterLeaveAnimation()],
    exportAs: 'appFineAddEdit'
})
export class FineAddEditComponent extends SubmitableForm<{
    personIds: FormControl<Person.Id[] | null>
    fineTemplate: FormControl<FineTemplate | 'custom' | null>
    fineTemplateRepetition: FormControl<number | null>
    reason: FormControl<string | null>
    fineValueType: FormControl<'amount' | FineAmount.Item.Type | null>
    amount: FormControl<number | null>
    fineValueItemCount: FormControl<number | null>
    date: FormControl<Date | null>
}, 'no-team-id'> {

    public readonly personId = input.required<Person.Id | null>();

    public readonly fine = input.required<Fine | null>();

    private teamDataManager = inject(TeamDataManagerService);

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private fineAmountPipe = inject(FineAmountPipe);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public readonly fineTemplateSelectElement = viewChild<FormElementComponent>('fineTemplateSelect');

    public constructor() {
        super({
            personIds: new FormControl<Person.Id[] | null>(null, [Validators.required]),
            fineTemplate: new FormControl<FineTemplate | 'custom' | null>(null, [Validators.required]),
            fineTemplateRepetition: new FormControl<number | null>(null, []),
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
                if (fineTemplate === null || fineTemplate === 'custom')
                    return null;
                if (fineTemplate.repetition === null)
                    return null;
                const fineTemplateRepetition = control.get('fineTemplateRepetition')!.value;
                if (fineTemplateRepetition !== null && fineTemplateRepetition > 0)
                    return null;
                control.get('fineTemplateRepetition')!.setErrors({ required: true });
                return {
                    fineTemplateRepetitionRequired: true
                };
            },
            control => {
                const fineTemplate = control.get('fineTemplate')!.value;
                if (fineTemplate !== 'custom')
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

    public get $person(): Observable<PersonWithFines | null> | null {
        const personId = this.personId();
        if (personId === null)
            return null;
        return this.teamDataManager.persons$.map(persons => persons.getOptional(personId));
    }

    public get buttonLabel(): string {
        const personIds = this.get('personIds')!.value;
        if (personIds !== null && personIds.length > 1)
            return $localize `:Button label to add fine for multiple people:Add fines`;
        if (this.fine() === null)
            return $localize `:Button label to add fine:Add fine`;
        return $localize `:Button label to save fine:Save fine`;
    }

    public get personOptions$(): Observable<{ label: string, key: Person.Id }[]> {
        return this.teamDataManager.persons$.map(personsDict => {
            const persons = personsDict.values;
            persons.sort((lhs, rhs) => {
                const lhsName = lhs.name.toUpperCase();
                const rhsName = rhs.name.toUpperCase();
                if (lhsName === rhsName)
                    return 0;
                return lhsName < rhsName ? -1 : 1;
            });
            return persons.map(person => ({
                label: person.name,
                key: person.id
            }));
        });
    }

    public get fineTemplateOptions$(): Observable<{ label: string, key: FineTemplate }[]> {
        return this.teamDataManager.fineTemplates$.map(fineTemplatesDict => {
            const fineTemplates = fineTemplatesDict.values;
            fineTemplates.sort((lhs, rhs) => {
                const lhsReason = lhs.reason.toUpperCase();
                const rhsReason = rhs.reason.toUpperCase();
                if (lhsReason === rhsReason)
                    return 0;
                return lhsReason < rhsReason ? -1 : 1;
            });
            return fineTemplates.map(template => ({
                label: `${template.reason} | ${this.fineAmountPipe.transform(template.amount)}`,
                key: template
            }));
        });
    }

    public customFineReasonSelected(customSelected: boolean) {
        const fineTemplateSelectElement = this.fineTemplateSelectElement();
        if (fineTemplateSelectElement !== undefined)
            fineTemplateSelectElement.closeSelectOverlay();
        this.get('fineTemplate')!.setValue(customSelected ? 'custom' : null);
    }

    public get fineTemplateRepetitionMaximum(): number | null {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'custom' || fineTemplateValue.repetition === null)
            return -1;
        return fineTemplateValue.repetition.maxCount;
    }

    public get fineTemplateRepetitionSuffix(): string {
        const fineTemplateValue = this.get('fineTemplate')!.value;
        if (fineTemplateValue === null || fineTemplateValue === 'custom' || fineTemplateValue.repetition === null)
            return '';
        const count = this.get('fineTemplateRepetition')!.value ?? 0;
        return new FineTemplateRepetition(fineTemplateValue.repetition.item, null).formattedWithoutCount(count);
    }

    public get fineValueTypeOptions(): { label: string, key: 'amount' | FineAmount.Item.Type }[] {
        return [
            {
                label: $localize `:Fine value type selection, amount:Amount`,
                key: 'amount'
            },
            ...FineAmount.Item.Type.all.map(item => ({
                label: FineAmount.Item.Type.formatted(item),
                key: item
            }))
        ];
    }

    public get fineValueItemCountSuffix(): string {
        const fineValueType = this.get('fineValueType')!.value;
        if (fineValueType === null || fineValueType === 'amount')
            return '';
        const count = this.get('fineValueItemCount')!.value ?? 0;
        return new FineAmount.Item(fineValueType, count).formattedWithoutCount();
    }

    public override reset() {
        super.reset();
        const personId = this.personId();
        this.get('personIds')!.setValue(personId !== null ? [personId] : []);
        this.get('fineTemplateRepetition')!.setValue(1);
        this.get('date')!.setValue(new Date());
        this.get('fineValueType')!.setValue('amount');
        this.get('fineValueItemCount')!.setValue(1);
        const fine = this.fine();
        if (fine === null)
            return;
        this.setValue({
            personIds: personId !== null ? [personId] : [],
            fineTemplate: 'custom',
            fineTemplateRepetition: 1,
            reason: fine.reason,
            fineValueType: fine.amount instanceof FineAmount.Money ? 'amount' : fine.amount.item,
            amount: fine.amount instanceof FineAmount.Money ? fine.amount.amount.completeValue : null,
            fineValueItemCount: fine.amount instanceof FineAmount.Item ? fine.amount.count : 1,
            date: fine.date.toDate
        });
    }

    private get fineTemplate(): { reason: string, value: FineAmount } {
        const fineTemplateValue = this.get('fineTemplate')!.value!;
        if (fineTemplateValue !== 'custom') {
            return {
                reason: fineTemplateValue.reason,
                value: fineTemplateValue.amount.multiplied(this.get('fineTemplateRepetition')!.value!)
            };
        }
        let value: FineAmount;
        const fineValueType = this.get('fineValueType')!.value!;
        switch (fineValueType) {
        case 'amount':
            value = FineAmount.money(MoneyAmount.builder.build(this.get('amount')!.value!));
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
            const fine = this.fine();
            const addOrUpdateFunction = fine === null ? this.firebaseFunctions.functions.fine.add : this.firebaseFunctions.functions.fine.update;
            await addOrUpdateFunction.execute({
                teamId: selectedTeamId,
                personId: personId,
                fine: new Fine(
                    fine === null ? Tagged.generate('fine') : fine.id,
                    fine === null ? 'notPayed' : fine.payedState,
                    UtcDate.fromDate(this.get('date')!.value!),
                    fineTemplate.reason,
                    fineTemplate.value
                ),
                configuration: configuration
            });
        }));
        this.popupDialogHandler.closeDialog();
    }
}
