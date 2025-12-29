import { Observable } from './../../../types/Observable';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { Fine, FineAmount, FineTemplate, FineTemplateRepetition, MoneyAmount, Person } from '@stevenkellner/team-conduct-api';
import { TeamDataManagerService } from '../../../services/team-data-manager/team-data-manager.service';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { AsyncPipe } from '@angular/common';
import { SubmitableForm } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { AddEditFormComponent } from '../../add-edit-form/add-edit-form.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { ButtonModule } from 'primeng/button';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { ConfigurationService } from '../../../services/configuration/configuration.service';

@Component({
    selector: 'app-fine-add-edit',
    imports: [AsyncPipe, ButtonModule, AddEditFormComponent, FormElementComponent],
    providers: [FineAmountPipe],
    templateUrl: './fine-add-edit.component.html',
    styleUrl: './fine-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'appFineAddEdit'
})
export class FineAddEditComponent extends SubmitableForm<{
    personIds: FormControl<Person.Id[] | null>
    fineTemplate: FormControl<FineTemplate | 'custom' | null>
    fineTemplateRepetition: FormControl<number | null>
    reason: FormControl<string | null>
    fineAmountItem: FormControl<'amount' | FineAmount.Item.Type | null>
    amount: FormControl<number | null>
    fineAmountItemCount: FormControl<number | null>
    date: FormControl<Date | null>
}, 'no-team-id'> {

    public readonly personId = input.required<Person.Id | null>();

    public readonly fine = input.required<Fine | null>();

    private teamDataManager = inject(TeamDataManagerService);

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    private fineAmountPipe = inject(FineAmountPipe);

    private configurationService = inject(ConfigurationService);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public readonly fineTemplateSelectElement = viewChild<FormElementComponent>('fineTemplateSelect');

    public constructor() {
        super({
            personIds: new FormControl<Person.Id[] | null>(null, [Validators.required]),
            fineTemplate: new FormControl<FineTemplate | 'custom' | null>(null, [Validators.required]),
            fineTemplateRepetition: new FormControl<number | null>(null, []),
            reason: new FormControl<string | null>(null, []),
            fineAmountItem: new FormControl<'amount' | FineAmount.Item.Type | null>(null, []),
            amount: new FormControl<number | null>(null, []),
            fineAmountItemCount: new FormControl<number | null>(null, []),
            date: new FormControl<Date | null>(null, [Validators.required])
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set in add / edit fine:Cannot assiciate the fine with a team`
        }, [
            control => {
                control.get('fineTemplateRepetition')!.setErrors(null);
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
                control.get('reason')!.setErrors(null);
                control.get('fineAmountItem')!.setErrors(null);
                control.get('amount')!.setErrors(null);
                control.get('fineAmountItemCount')!.setErrors(null);
                const fineTemplate = control.get('fineTemplate')!.value;
                if (fineTemplate !== 'custom')
                    return null;
                const reason = control.get('reason')!.value;
                const reasonValid = reason !== null && reason !== '';
                if (!reasonValid)
                    control.get('reason')!.setErrors({ required: true });
                const fineAmountItem = control.get('fineAmountItem')!.value;
                if (fineAmountItem === null) {
                    control.get('fineAmountItem')!.setErrors({ required: true });
                    return {
                        reasonRequired: !reasonValid,
                        fineAmountItemRequired: true
                    };
                }
                switch (fineAmountItem) {
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
                    const fineAmountItemCount = control.get('fineAmountItemCount')!.value;
                    const fineAmountItemCountValid = fineAmountItemCount !== null && fineAmountItemCount > 0;
                    if (!fineAmountItemCountValid)
                        control.get('fineAmountItemCount')!.setErrors({ required: true });
                    if (reasonValid && fineAmountItemCountValid)
                        return null;
                    return {
                        reasonRequired: !reasonValid,
                        fineAmountItemCountRequired: !fineAmountItemCountValid
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
        return new FineTemplateRepetition(fineTemplateValue.repetition.item, null).formattedWithoutCount(count, this.configurationService.locale);
    }

    public get fineAmountItemOptions(): { label: string, key: 'amount' | FineAmount.Item.Type }[] {
        return [
            {
                label: $localize `:Fine value type selection, amount:Amount`,
                key: 'amount'
            },
            ...FineAmount.Item.Type.all.map(item => ({
                label: FineAmount.Item.Type.formatted(item, this.configurationService.locale),
                key: item
            }))
        ];
    }

    public get fineAmountItemCountSuffix(): string {
        const fineAmountItem = this.get('fineAmountItem')!.value;
        if (fineAmountItem === null || fineAmountItem === 'amount')
            return '';
        const count = this.get('fineAmountItemCount')!.value ?? 0;
        return new FineAmount.Item(fineAmountItem, count).formattedWithoutCount(this.configurationService.locale);
    }

    public override reset() {
        super.reset();
        const personId = this.personId();
        this.get('personIds')!.setValue(personId !== null ? [personId] : []);
        this.get('fineTemplateRepetition')!.setValue(1);
        this.get('date')!.setValue(new Date());
        this.get('fineAmountItem')!.setValue('amount');
        this.get('fineAmountItemCount')!.setValue(1);
        const fine = this.fine();
        if (fine === null)
            return;
        this.setValue({
            personIds: personId !== null ? [personId] : [],
            fineTemplate: 'custom',
            fineTemplateRepetition: 1,
            reason: fine.reason,
            fineAmountItem: fine.amount instanceof FineAmount.Money ? 'amount' : fine.amount.item,
            amount: fine.amount instanceof FineAmount.Money ? fine.amount.amount.completeValue : null,
            fineAmountItemCount: fine.amount instanceof FineAmount.Item ? fine.amount.count : 1,
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
        const fineAmountItem = this.get('fineAmountItem')!.value!;
        switch (fineAmountItem) {
        case 'amount':
            value = FineAmount.money(MoneyAmount.builder.build(this.get('amount')!.value!));
            break;
        default:
            value = FineAmount.item(fineAmountItem, this.get('fineAmountItemCount')!.value!);
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
                configuration: this.configurationService.configuration
            });
        }));
        this.popupDialogHandler.closeDialog();
    }
}
