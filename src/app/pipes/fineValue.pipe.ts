import { SummedFineValue } from '../types/SummedFineValue';
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Amount } from '../types';
import { FineValue } from '../types/FineValue';
import { entries } from '../utils';

@Pipe({
    name: 'fineValue',
    standalone: true
})
export class FineValuePipe implements PipeTransform {

    private localeId = inject(LOCALE_ID);

    public transform(fineValue: Amount | number | FineValue | SummedFineValue, currency: string = 'EUR'): string {
        const formatter = Intl.NumberFormat(this.localeId, {
            style: 'currency',
            currency: currency
        });
        if (typeof fineValue === 'number')
            return formatter.format(fineValue);
        if (fineValue instanceof Amount)
            return formatter.format(fineValue.completeValue);
        if (!(fineValue instanceof SummedFineValue)) {
            if (fineValue.type === 'amount')
                return formatter.format(fineValue.amount.completeValue);
            switch (fineValue.item) {
            case 'crateOfBeer':
                if (fineValue.count === 1)
                    return $localize `:Amount description of create of beer, singluar:One Create of Beer`;
                return $localize `:Amount description of create of beer, plural:${fineValue.count} Creates of Beer`;
            }
        }
        let description = formatter.format(fineValue.amount.completeValue);
        for (const { key, value } of entries(fineValue.items)) {
            if (value === 0)
                continue;
            description += `, ${this.transform(FineValue.item(key, value), currency)}`;
        }
        return description;
    }
}
