import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { PersonId, Fine, Amount } from '../../../types';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { markAllAsDirty } from '../../../../utils/markAllAsDirty';
import { FirebaseFunctionsService } from '../../../services/firebase-functions.service';
import { TeamId } from '../../../types/Team';
import { Tagged } from '../../../types/Tagged';
import { UtcDate } from '../../../types/UtcDate';

@Component({
    selector: 'app-fine-add-edit',
    standalone: true,
    imports: [ReactiveFormsModule, InputTextModule, ButtonModule, FloatLabelModule, CalendarModule, InputNumberModule],
    templateUrl: './fine-add-edit.component.html',
    styleUrl: './fine-add-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FineAddEditComponent implements OnInit {

    @Input({ required: true }) public teamId!: TeamId;

    @Input({ required: true }) public personId!: PersonId;

    @Input({ required: true }) public fine!: Fine | null;

    @Output() public readonly finally = new EventEmitter<void>();

    private firebaseFunctions = inject(FirebaseFunctionsService);

    public state: 'error' | 'loading' | null = null;

    public fineForm = new FormGroup({
        reason: new FormControl<string | null>(null, [Validators.required]),
        date: new FormControl<Date | null>(null, [Validators.required]),
        amount: new FormControl<number | null>(null, [Validators.required])
    });

    public ngOnInit() {
        if (this.fine) {
            this.fineForm.setValue({
                reason: this.fine.reason,
                date: this.fine.date.toDate,
                amount: this.fine.amount.completeValue
            });
        }
    }

    public async addOrUpdateFine(functionKey: 'add' | 'update') {
        if (this.state === 'loading')
            return;
        markAllAsDirty(this.fineForm);
        if (this.fineForm.invalid) {
            this.state = 'error';
            return;
        }
        this.state = 'loading';

        await this.firebaseFunctions.function('fine').function(functionKey).call({
            teamId: this.teamId,
            personId: this.personId,
            fine: {
                id: this.fine === null ? Tagged.generate('fine') : this.fine.id,
                reason: this.fineForm.get('reason')!.value!,
                date: UtcDate.fromDate(this.fineForm.get('date')!.value!),
                amount: Amount.from(this.fineForm.get('amount')!.value!),
                payedState: this.fine === null ? 'notPayed' : this.fine.payedState
            }
        });

        this.fineForm.reset();
        this.state = null;
        this.finally.emit();
    }
}
