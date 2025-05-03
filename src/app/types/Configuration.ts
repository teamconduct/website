import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';

export type Configuration = {
    currency: Configuration.Currency,
    locale: Configuration.Locale
}

export namespace Configuration {

    export type Currency = 'EUR' | 'USD';

    export namespace Currency {

        export const all: Currency[] = ['EUR', 'USD'];

        export const builder = new ValueTypeBuilder<Currency>();
    }

    export type Locale = 'de' | 'en';

    export namespace Locale {

        export const all: Locale[] = ['de', 'en'];

        export const builder = new ValueTypeBuilder<Locale>();
    }

    export const builder = new ObjectTypeBuilder<Flatten<Configuration>, Configuration>({
        currency: Currency.builder,
        locale: Locale.builder
    });
}
