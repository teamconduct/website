import { inject, Pipe, PipeTransform } from '@angular/core';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { ConfigurationService } from '../../services/configuration/configuration.service';

@Pipe({
    name: 'date',
    standalone: true
})
export class DatePipe implements PipeTransform {

    private configurationService = inject(ConfigurationService);

    public transform(date: UtcDate | Date, dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'long', timeStyle: Intl.DateTimeFormatOptions['timeStyle'] = undefined): string {
        const formatter = Intl.DateTimeFormat(this.configurationService.locale, {
            dateStyle: dateStyle,
            timeStyle: timeStyle
        });
        if (date instanceof UtcDate)
            return formatter.format(date.toDate);
        return formatter.format(date);
    }
}
