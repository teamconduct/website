import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Amount } from '../types';

@Pipe({
    name: 'amount',
    standalone: true
})
export class AmountPipe implements PipeTransform {

    private localeId = inject(LOCALE_ID);

    public transform(amount: Amount | number, currency: string = 'EUR'): string {
        const formatter = Intl.NumberFormat(this.localeId, {
            style: 'currency',
            currency: currency
        });
        if (typeof amount === 'number')
            return formatter.format(amount);
        return formatter.format(amount.completeValue);
    }
}
