import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { UserManagerService } from '../../../services/user-manager.service';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { FineAmount, FineTemplate, FineTemplateRepetition, MoneyAmount } from '@stevenkellner/team-conduct-api';
import { Tagged } from '@stevenkellner/typescript-common-functionality';

@Component({
    selector: 'app-fine-template-add-edit',
    standalone: true,
    imports: [AddEditFormDialogComponent, FormElementComponent],
    templateUrl: './fine-template-add-edit.component.html',
    styleUrl: './fine-template-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineTemplateAddEditComponent extends SubmitableForm<{
    reason: FormControl<string | null>
    fineValueType: FormControl<'amount' | FineAmount.Item.Type | null>
    amount: FormControl<number | null>
    fineValueItemCount: FormControl<number | null>
    multipleItem: FormControl<FineTemplateRepetition.Item | 'none' | null>
    multipleMaxCount: FormControl<number | null>
}, 'no-team-id'>  {

    @Input({ required: true }) public visible!: boolean;

    @Output() public readonly visibleChange = new EventEmitter<boolean>();

    @Input() public fineTemplate: FineTemplate | null = null;

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public constructor() {
        super({
            reason: new FormControl<string | null>(null, [Validators.required]),
            fineValueType: new FormControl<'amount' | FineAmount.Item.Type | null>(null, [Validators.required]),
            amount: new FormControl<number | null>(null, []),
            fineValueItemCount: new FormControl<number | null>(null, []),
            multipleItem: new FormControl<FineTemplateRepetition.Item | 'none' | null>(null, []),
            multipleMaxCount: new FormControl<number | null>(null, [Validators.min(1)])
        }, {
            'no-team-id': $localize `:Error message that no team ID is set:Cannot assiciate the fine template with a team`
        }, [
            control => {
                const fineValueType = control.get('fineValueType')!.value;
                if (fineValueType === null || fineValueType !== 'amount')
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
                const fineValueType = control.get('fineValueType')!.value;
                if (fineValueType === null || fineValueType === 'amount')
                    return null;
                const itemCount = control.get('fineValueItemCount')!.value;
                const itemCountValid = itemCount !== null && itemCount > 0;
                if (itemCountValid)
                    return null;
                control.get('fineValueItemCount')!.setErrors({ required: true });
                return {
                    itemCountRequired: !itemCountValid
                };
            }
        ]);
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

    public get multipleOptions(): { label: string, key: FineTemplateRepetition.Item | 'none' }[] {
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

    public get multipleMaxCountSuffix(): string {
        const maxCount = this.get('multipleMaxCount')!.value;
        if (maxCount === 1)
            return $localize `:Fine template multiple max count input suffix, single:time`;
        return $localize `:Fine template multiple max count input suffix, plural:times`;
    }

    public get headerLabel(): string {
        if (this.fineTemplate === null)
            return $localize `:Header label for adding a fine template:Add a new fine template`;
        return $localize `:Header label for editing a fine template:Edit ${this.fineTemplate.reason}`;
    }

    public get buttonLabel(): string {
        if (this.fineTemplate === null)
            return $localize `:Button label to add fine template:Add fine template`;
        return $localize `:Button label to save fine template:Save fine template`;
    }

    public override reset() {
        super.reset();
        this.get('fineValueType')!.setValue('amount');
        this.get('fineValueItemCount')!.setValue(1);
        if (this.fineTemplate === null)
            return;
        this.setValue({
            reason: this.fineTemplate.reason,
            fineValueType: this.fineTemplate.amount instanceof FineAmount.Money ? 'amount' : this.fineTemplate.amount.item,
            amount: this.fineTemplate.amount instanceof FineAmount.Money ? this.fineTemplate.amount.amount.completeValue : null,
            fineValueItemCount: this.fineTemplate.amount instanceof FineAmount.Item ? this.fineTemplate.amount.count : 1,
            multipleItem: this.fineTemplate.repetition === null ? null : this.fineTemplate.repetition.item,
            multipleMaxCount: this.fineTemplate.repetition === null ? null : this.fineTemplate.repetition.maxCount
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        const selectedTeamId = this.userManager.selectedTeamId$.value;
        if (selectedTeamId === null)
            return 'no-team-id';

        let amount: FineAmount;
        const fineValueType = this.get('fineValueType')!.value!;
        switch (fineValueType) {
        case 'amount':
            amount = FineAmount.money(MoneyAmount.builder.build(this.get('amount')!.value!));
            break;
        default:
            amount = FineAmount.item(fineValueType, this.get('fineValueItemCount')!.value!);
            break;
        }

        let repetition: FineTemplateRepetition | null = null;
        const multipleItem = this.get('multipleItem')!.value;
        if (multipleItem !== null && multipleItem !== 'none')
            repetition = new FineTemplateRepetition(multipleItem, this.get('multipleMaxCount')!.value);
        const addOrUpdateFunction = this.fineTemplate === null ? this.firebaseFunctions.functions.fineTemplate.add : this.firebaseFunctions.functions.fineTemplate.update;
        await addOrUpdateFunction.execute({
            teamId: selectedTeamId,
            fineTemplate: new FineTemplate(
                this.fineTemplate === null ? Tagged.generate('fineTemplate') : this.fineTemplate.id,
                this.get('reason')!.value!,
                amount,
                repetition
            )
        });
    }
}
