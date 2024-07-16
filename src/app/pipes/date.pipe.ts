import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { UtcDate } from '../types/UtcDate';

@Pipe({
    name: 'date',
    standalone: true
})
export class DatePipe implements PipeTransform {

    private localeId = inject(LOCALE_ID);

    public transform(date: UtcDate | Date, dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'long', timeStyle: Intl.DateTimeFormatOptions['timeStyle'] = undefined): string {
        const formatter = Intl.DateTimeFormat(this.localeId, {
            dateStyle: dateStyle,
            timeStyle: timeStyle
        });
        if (date instanceof UtcDate)
            return formatter.format(date.toDate);
        return formatter.format(date);
    }
}
