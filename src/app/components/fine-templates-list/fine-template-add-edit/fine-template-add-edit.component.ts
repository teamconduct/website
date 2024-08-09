import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Amount, FineTemplate, FineTemplateMultiple, FineTemplateMultipleItem } from '../../../types';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { Tagged } from '../../../types/Tagged';
import { UserManagerService } from '../../../services/user-manager.service';
import { SubmitableForm } from '../../../types/SubmitableForm';
import { AddEditFormDialogComponent } from '../../add-edit-form-dialog/add-edit-form-dialog.component';
import { FormElementComponent } from '../../add-edit-form/form-element/form-element.component';

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
    amount: FormControl<number | null>
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
            amount: new FormControl<number | null>(null, [Validators.required]),
            multipleItem: new FormControl<FineTemplateMultipleItem | 'none' | null>(null, []),
            multipleMaxCount: new FormControl<number | null>(null, [Validators.min(1)])
        }, {
            'no-team-id': $localize `:Error message that no team ID is set:Cannot assiciate the fine template with a team`
        });
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
        if (this.fineTemplate === null)
            return;
        this.setValue({
            reason: this.fineTemplate.reason,
            amount: this.fineTemplate.amount.completeValue,
            multipleItem: this.fineTemplate.multiple === null ? null : this.fineTemplate.multiple.item,
            multipleMaxCount: this.fineTemplate.multiple === null ? null : this.fineTemplate.multiple.maxCount
        });
    }

    public override async submit(): Promise<'no-team-id' | void> {
        if (this.userManager.currentTeamId === null)
            return 'no-team-id';

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
                amount: Amount.from(this.get('amount')!.value!),
                multiple: multiple
            }
        });
    }
}
