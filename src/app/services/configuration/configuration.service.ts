import { inject, Injectable, LOCALE_ID } from '@angular/core';
import { Configuration, Currency, Locale } from '@stevenkellner/team-conduct-api';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {

    private readonly localeId = inject(LOCALE_ID);

    public get locale(): Locale {
        if (this.localeId === 'en' || this.localeId.startsWith('en-'))
            return 'en';
        if (this.localeId === 'de' || this.localeId.startsWith('de-'))
            return 'de';
        return 'en';
    }

    public get currency(): Currency {
        // Currently, we only support EUR, TODO: Extend this when needed
        return 'EUR';
    }

    public get configuration(): Configuration {
        return new Configuration(this.currency, this.locale);
    }
}
