import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { FineAmount, FineTemplate, FineTemplateRepetition, MoneyAmount } from '@stevenkellner/team-conduct-api';
import { SubmitableForm } from '../../../types';
import { FormControl, Validators } from '@angular/forms';
import { UserManagerService } from '../../../services/user-manager/user-manager.service';
import { FirebaseFunctionsService } from '../../../services/firebase-functions/firebase-functions.service';
import { PopupDialogHandlerService } from '../../../services/popup-dialog-handler/popup-dialog-handler.service';
import { Tagged } from '@stevenkellner/typescript-common-functionality';
import { AddEditFormComponent } from '../../add-edit-form/add-edit-form.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';

@Component({
    selector: 'app-fine-template-add-edit',
    imports: [AddEditFormComponent, FormElementComponent],
    templateUrl: './fine-template-add-edit.component.html',
    styleUrl: './fine-template-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'appFineTemplateAddEdit'
})
export class FineTemplateAddEditComponent extends SubmitableForm<{
    reason: FormControl<string | null>,
    fineAmountItem: FormControl<'amount' | FineAmount.Item.Type | null>,
    amount: FormControl<number | null>,
    fineAmountItemCount: FormControl<number | null>,
    repetitionItem: FormControl<FineTemplateRepetition.Item | 'none' | null>,
    repetitionMaxCount: FormControl<number | null>
}, 'no-team-id'> {

    public readonly fineTemplate = input.required<FineTemplate | null>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private popupDialogHandler = inject(PopupDialogHandlerService);

    public readonly headerElement = viewChild.required<TemplateRef<any>>('header');

    public constructor() {
        super({
            reason: new FormControl<string | null>(null, [Validators.required]),
            fineAmountItem: new FormControl<'amount' | FineAmount.Item.Type | null>(null, [Validators.required]),
            amount: new FormControl<number | null>(null, []),
            fineAmountItemCount: new FormControl<number | null>(null, []),
            repetitionItem: new FormControl<FineTemplateRepetition.Item | 'none' | null>(null, []),
            repetitionMaxCount: new FormControl<number | null>(null, [Validators.min(1)])
        }, {
            'no-team-id': $localize `:Error message when the team ID is not set in add / edit fine template:Cannot assiciate the fine template with a team`
        }, [
            control => {
                control.get('amount')!.setErrors(null);
                const fineAmountItem = control.get('fineAmountItem')!.value;
                if (fineAmountItem === null || fineAmountItem !== 'amount')
                    return null;
                const amount = control.get('amount')!.value;
                const amountValid = amount !== null && amount > 0;
                if (amountValid)
                    return null;
                control.get('amount')!.setErrors({ required: true });
                return {
                    amountRequired: true
                };
            },
            control => {
                control.get('fineAmountItemCount')!.setErrors(null);
                const fineAmountItem = control.get('fineAmountItem')!.value;
                if (fineAmountItem === null || fineAmountItem === 'amount')
                    return null;
                const itemCount = control.get('fineAmountItemCount')!.value;
                const itemCountValid = itemCount !== null && itemCount > 0;
                if (itemCountValid)
                    return null;
                control.get('fineAmountItemCount')!.setErrors({ required: true });
                return {
                    itemCountRequired: !itemCountValid
                };
            }
        ]);
    }

    public get buttonLabel(): string {
        if (this.fineTemplate() === null)
            return $localize `:Button label to add fine template:Add fine template`;
        return $localize `:Button label to save fine template:Save fine template`;
    }

    public get fineAmountItemOptions(): { label: string, key: 'amount' | FineAmount.Item.Type }[] {
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

    public get fineAmountItemCountSuffix(): string {
        const fineAmountItem = this.get('fineAmountItem')!.value;
        if (fineAmountItem === null || fineAmountItem === 'amount')
            return '';
        const count = this.get('fineAmountItemCount')!.value ?? 0;
        return new FineAmount.Item(fineAmountItem, count).formattedWithoutCount();
    }

    public get repetitionOptions(): { label: string, key: FineTemplateRepetition.Item | 'none' }[] {
        return [
            {
                label: $localize `:Fine template multiple item selection, none selected:Do not repeat`,
                key: 'none'
            },
            ...FineTemplateRepetition.Item.all.map(item => ({
                label: FineTemplateRepetition.Item.formatted(item),
                key: item
            }))
        ];
    }

    public get repetitionMaxCountSuffix(): string {
        const maxCount = this.get('repetitionMaxCount')!.value;
        if (maxCount === 1)
            return $localize `:Fine template multiple max count input suffix, single:time`;
        return $localize `:Fine template multiple max count input suffix, plural:times`;
    }

    public override reset() {
        super.reset();
        this.get('fineAmountItem')!.setValue('amount');
        this.get('fineAmountItemCount')!.setValue(1);
        this.get('repetitionItem')!.setValue('none');
        const fineTemplate = this.fineTemplate();
        if (fineTemplate === null)
            return;
        this.setValue({
            reason: fineTemplate.reason,
            fineAmountItem: fineTemplate.amount instanceof FineAmount.Money ? 'amount' : fineTemplate.amount.item,
            amount: fineTemplate.amount instanceof FineAmount.Money ? fineTemplate.amount.amount.completeValue : null,
            fineAmountItemCount: fineTemplate.amount instanceof FineAmount.Item ? fineTemplate.amount.count : 1,
            repetitionItem: fineTemplate.repetition === null ? null : fineTemplate.repetition.item,
            repetitionMaxCount: fineTemplate.repetition === null ? null : fineTemplate.repetition.maxCount
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';

        let amount: FineAmount;
        const fineAmountItem = this.get('fineAmountItem')!.value!;
        switch (fineAmountItem) {
        case 'amount':
            amount = FineAmount.money(MoneyAmount.builder.build(this.get('amount')!.value!));
            break;
        default:
            amount = FineAmount.item(fineAmountItem, this.get('fineAmountItemCount')!.value!);
            break;
        }

        let repetition: FineTemplateRepetition | null = null;
        const repetitionItem = this.get('repetitionItem')!.value;
        if (repetitionItem !== null && repetitionItem !== 'none')
            repetition = new FineTemplateRepetition(repetitionItem, this.get('repetitionMaxCount')!.value);
        const fineTemplate = this.fineTemplate();
        const addOrUpdateFunction = fineTemplate === null ? this.firebaseFunctions.functions.fineTemplate.add : this.firebaseFunctions.functions.fineTemplate.update;
        await addOrUpdateFunction.execute({
            teamId: selectedTeamId,
            fineTemplate: new FineTemplate(
                fineTemplate === null ? Tagged.generate('fineTemplate') : fineTemplate.id,
                this.get('reason')!.value!,
                amount,
                repetition
            )
        });
        this.popupDialogHandler.closeDialog();
    }
}
