import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Amount, FineTemplate, FineTemplateMultiple, FineTemplateMultipleItem } from '../../../types';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { Tagged } from '../../../types/Tagged';
import { UserManagerService } from '../../../services/user-manager.service';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';
import { FineValue, FineValueItem } from '../../../types/FineValue';

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
    fineValueType: FormControl<'amount' | FineValueItem | null>
    amount: FormControl<number | null>
    fineValueItemCount: FormControl<number | null>
    multipleItem: FormControl<FineTemplateMultipleItem | 'none' | null>
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
            fineValueType: new FormControl<'amount' | FineValueItem | null>(null, [Validators.required]),
            amount: new FormControl<number | null>(null, []),
            fineValueItemCount: new FormControl<number | null>(null, []),
            multipleItem: new FormControl<FineTemplateMultipleItem | 'none' | null>(null, []),
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

    public get fineValueTypeOptions(): { label: string, key: 'amount' | FineValueItem }[] {
        return [
            {
                label: $localize `:Fine value type selection, amount:Amount`,
                key: 'amount'
            },
            ...FineValueItem.all.map(item => ({
                label: FineValueItem.description(item),
                key: item
            }))
        ];
    }

    public get fineValueItemCountSuffix(): string {
        const fineValueType = this.get('fineValueType')!.value;
        if (fineValueType === null || fineValueType === 'amount')
            return '';
        const count = this.get('fineValueItemCount')!.value;
        return FineValueItem.description(fineValueType, count !== 1);
    }

    public get multipleOptions(): { label: string, key: FineTemplateMultipleItem | 'none' }[] {
        return [
            {
                label: $localize `:Fine template multiple item selection, none selected:Do not repeat`,
                key: 'none'
            },
            ...FineTemplateMultipleItem.all.map(item => ({
                label: FineTemplateMultipleItem.description(item),
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
            fineValueType: this.fineTemplate.value.type === 'amount' ? 'amount' : this.fineTemplate.value.item,
            amount: this.fineTemplate.value.type === 'amount' ? this.fineTemplate.value.amount.completeValue : null,
            fineValueItemCount: this.fineTemplate.value.type === 'item' ? this.fineTemplate.value.count : 1,
            multipleItem: this.fineTemplate.multiple === null ? null : this.fineTemplate.multiple.item,
            multipleMaxCount: this.fineTemplate.multiple === null ? null : this.fineTemplate.multiple.maxCount
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        if (this.userManager.currentTeamId === null)
            return 'no-team-id';

        let value: FineValue;
        const fineValueType = this.get('fineValueType')!.value!;
        switch (fineValueType) {
        case 'amount':
            value = FineValue.amount(Amount.from(this.get('amount')!.value!));
            break;
        default:
            value = FineValue.item(fineValueType, this.get('fineValueItemCount')!.value!);
            break;
        }

        let multiple: FineTemplateMultiple | null = null;
        const multipleItem = this.get('multipleItem')!.value;
        if (multipleItem !== null && multipleItem !== 'none') {
            multiple = {
                item: multipleItem,
                maxCount: this.get('multipleMaxCount')!.value
            };
        }
        await this.firebaseFunctions.function('fineTemplate').function(this.fineTemplate === null ? 'add' : 'update').call({
            teamId: this.userManager.currentTeamId,
            fineTemplate: {
                id: this.fineTemplate === null ? Tagged.generate('fineTemplate') : this.fineTemplate.id,
                reason: this.get('reason')!.value!,
                value: value,
                multiple: multiple
            }
        });
    }
}
