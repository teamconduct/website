import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PersonWithFines } from '../../../types/PersonWithFines';
import { SummedFineValue } from '../../../types';
import { PayedState } from '@stevenkellner/team-conduct-api';
import {  faWallet, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope, faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons';
import { SkeletonModule } from 'primeng/skeleton';
import { Tag, TagModule } from 'primeng/tag';
import { FineAmountPipe } from '../../../pipes/fine-amount/fine-amount.pipe';

@Component({
    selector: 'app-person-list-element',
    imports: [SkeletonModule, TagModule, FineAmountPipe],
    templateUrl: './person-list-element.component.html',
    styleUrl: './person-list-element.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonListElementComponent {

    public readonly person = input.required<PersonWithFines | null>();

    public readonly hideTopBorder = input<boolean>(false);

    public readonly personSelected = output<PersonWithFines>();

    public get payedTags(): Record<'total' | 'notPayed' | 'payed', { label: string, value: SummedFineValue | null, severity: Tag['severity'], icon: IconDefinition }> {
        const person = this.person();
        return {
            total: {
                label: $localize `:Label of total amount:Total`,
                value: person === null ? null : person.fineValues.total,
                severity: 'info',
                icon: faWallet
            },
            notPayed:{
                label: $localize `:Label of not payed amount:Open`,
                value: person === null ? null : person.fineValues.notPayed,
                severity: PayedState.payedTag('notPayed').severity,
                icon: faEnvelopeOpen
            },
            payed: {
                label: $localize `:Label of payed amount:Paid`,
                value: person === null ? null : person.fineValues.payed,
                severity: PayedState.payedTag('payed').severity,
                icon: faEnvelope
            }
        };
    };

    public get displayValue(): { type: 'notPayed' | 'total', value: SummedFineValue } | null {
        const person = this.person();
        if (person === null)
            return null;
        if (person.fineValues.notPayed.isZero)
            return {
                type: 'total',
                value: person.fineValues.total
            };
        return {
            type: 'notPayed',
            value: person.fineValues.notPayed
        };
    }

    public showPersonDetails() {
        const person = this.person();
        if (person !== null)
            this.personSelected.emit(person);
    }
}
