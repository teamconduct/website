import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Amount, FineTemplate, FineTemplateMultiple, FineTemplateMultipleItem } from '../../../types';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { markAllAsDirty } from '../../../../utils/markAllAsDirty';
import { Tagged } from '../../../types/Tagged';
import { DropdownModule } from 'primeng/dropdown';
import { enterLeaveAnimation } from '../../../animations/enterLeaveAnimation';
import { UserManagerService } from '../../../services/user-manager.service';

@Component({
    selector: 'app-fine-template-add-edit',
    standalone: true,
    imports: [ReactiveFormsModule, InputTextModule, ButtonModule, FloatLabelModule, InputNumberModule, DropdownModule],
    templateUrl: './fine-template-add-edit.component.html',
    styleUrl: './fine-template-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [enterLeaveAnimation]
})
export class FineTemplateAddEditComponent implements OnInit {

    @Input() public fineTemplate: FineTemplate | null = null;

    @Output() public readonly finally = new EventEmitter<void>();

    private userManager = inject(UserManagerService);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public state: 'error' | 'loading' | null = null;

    public fineTemplateForm = new FormGroup({
        reason: new FormControl<string | null>(null, [Validators.required]),
        amount: new FormControl<number | null>(null, [Validators.required]),
        multipleItem: new FormControl<FineTemplateMultipleItem | 'none'>('none', []),
        multipleMaxCount: new FormControl<number | null>(null, [Validators.min(1)])
    });

    public ngOnInit() {
        if (this.fineTemplate) {
            this.fineTemplateForm.setValue({
                reason: this.fineTemplate.reason,
                amount: this.fineTemplate.amount.completeValue,
                multipleItem: this.fineTemplate.multiple === null ? 'none' : this.fineTemplate.multiple.item,
                multipleMaxCount: this.fineTemplate.multiple === null ? null : this.fineTemplate.multiple.maxCount
            });
        }
    }

    public get multipleOptions(): { label: string, key: FineTemplateMultipleItem | 'none' }[] {
        return [
            {
                label: $localize `:Fine template multiple item selection, none selected:None`,
                key: 'none'
            },
            ...FineTemplateMultipleItem.all.map(item => ({
                label: FineTemplateMultipleItem.description(item),
                key: item
            }))
        ];
    }

    public get multipleMaxCountSuffix(): string {
        const maxCount = this.fineTemplateForm.get('multipleMaxCount')!.value;
        if (maxCount === 1)
            return $localize `:Fine template multiple max count input suffix, single:time`;
        return $localize `:Fine template multiple max count input suffix, plural:times`;
    }

    public async addOrUpdateFineTemplate(functionKey: 'add' | 'update') {
        if (this.userManager.currentTeamId === null)
            return;

        if (this.state === 'loading')
            return;
        markAllAsDirty(this.fineTemplateForm);
        if (this.fineTemplateForm.invalid) {
            this.state = 'error';
            return;
        }
        this.state = 'loading';

        let multiple: FineTemplateMultiple | null = null;
        const multipleItem = this.fineTemplateForm.get('multipleItem')!.value!;
        if (multipleItem !== 'none') {
            multiple = {
                item: multipleItem,
                maxCount: this.fineTemplateForm.get('multipleMaxCount')!.value
            };
        }
        await this.firebaseFunctions.function('fineTemplate').function(functionKey).call({
            teamId: this.userManager.currentTeamId,
            fineTemplate: {
                id: this.fineTemplate === null ? Tagged.generate('fineTemplate') : this.fineTemplate.id,
                reason: this.fineTemplateForm.get('reason')!.value!,
                amount: Amount.from(this.fineTemplateForm.get('amount')!.value!),
                multiple: multiple
            }
        });

        this.fineTemplateForm.reset();
        this.state = null;
        this.finally.emit();
    }
}
