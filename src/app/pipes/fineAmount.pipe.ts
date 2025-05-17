import { FineAmount, MoneyAmount } from '@stevenkellner/team-conduct-api';
import { SummedFineValue } from '../types/SummedFineValue';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { entries } from '@stevenkellner/typescript-common-functionality';

@Pipe({
    name: 'fineAmount',
    standalone: true
})
export class FineAmountPipe implements PipeTransform {

    private localeId = inject(LOCALE_ID);

    public transform(fineAmount: MoneyAmount | number | FineAmount | SummedFineValue, currency: string = 'EUR'): string {
        const formatter = Intl.NumberFormat(this.localeId, {
            style: 'currency',
            currency: currency
        });
        if (typeof fineAmount === 'number')
            return formatter.format(fineAmount);
        else if (fineAmount instanceof MoneyAmount)
            return this.transform(fineAmount.completeValue, currency);
        else if (fineAmount instanceof FineAmount.Money)
            return this.transform(fineAmount.amount.completeValue, currency);
        else if (fineAmount instanceof FineAmount.Item) {
            switch (fineAmount.item) {
            case 'crateOfBeer':
                if (fineAmount.count === 1)
                    return $localize `:Amount description of create of beer, singluar:One Create of Beer`;
                return $localize `:Amount description of create of beer, plural:${fineAmount.count}\u00A0Creates of Beer`;
            }
        } else if (fineAmount instanceof SummedFineValue) {
            let description = this.transform(fineAmount.amount.completeValue, currency);
            for (const { key, value } of entries(fineAmount.items)) {
                if (value === 0)
                    continue;
                description += `, ${this.transform(FineAmount.item(key, value), currency)}`;
            }
            return description;
        }
        return '';
    }
}
