import { TypeBuilder } from '../typeBuilder';
import { Configuration } from './Configuration';
import { Flattable, Flatten } from './Flattable';

export class MoneyAmount implements Flattable<number> {

    public constructor(
        public readonly value: number,
        public readonly subunitValue: number
    ) {}

    public static from(value: number): MoneyAmount {
        return new MoneyAmount(
            Math.floor(value),
            Math.round((value - Math.floor(value)) * 100)
        );
    }

    public static get zero(): MoneyAmount {
        return new MoneyAmount(0, 0);
    }

    public added(amount: MoneyAmount): MoneyAmount {
        const subunitValue = this.subunitValue + amount.subunitValue;
        const value = this.value + amount.value + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    public multiplied(factor: number): MoneyAmount {
        const subunitValue = this.subunitValue * factor;
        const value = this.value * factor + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    public formatted(currency: Configuration.Currency): string {
        const numberFormat = Intl.NumberFormat('de-DE'/* TODO: i18n.getLocale() */, {
            style: 'currency',
            currency: currency
        });
        return numberFormat.format(this.value + this.subunitValue / 100);
    }

    public get completeValue(): number {
        return this.value + this.subunitValue / 100;
    }

    public get flatten(): number {
        return this.completeValue;
    }
}

export namespace MoneyAmount {
    export const builder = new TypeBuilder<Flatten<MoneyAmount>, MoneyAmount>(MoneyAmount.from);
}
