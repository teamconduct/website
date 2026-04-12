import { inject, Pipe, PipeTransform } from '@angular/core';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { DataManagerService } from '../../services/data-manager/data-manager.service';

@Pipe({
    name: 'date',
    standalone: true
})
export class DatePipe implements PipeTransform {

    private dataManager = inject(DataManagerService);

    public transform(date: UtcDate | Date, dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = 'long', timeStyle: Intl.DateTimeFormatOptions['timeStyle'] = undefined): string {
        const teamSettings = this.dataManager.selectedTeam$.value?.team$.value?.settings;
        if (!teamSettings)
            return '';
        const formatter = Intl.DateTimeFormat(teamSettings.locale, {
            dateStyle: dateStyle,
            timeStyle: timeStyle
        });
        if (date instanceof UtcDate)
            return formatter.format(date.toDate);
        return formatter.format(date);
    }
}
