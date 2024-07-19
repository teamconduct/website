import { TypeBuilder } from '../typeBuilder';
import { Flattable, Flatten } from './Flattable';

export class Amount implements Flattable<number> {

    public constructor(
        public readonly value: number,
        public readonly subunitValue: number
    ) {}

    public static from(value: number): Amount {
        return new Amount(
            Math.floor(value),
            Math.round((value - Math.floor(value)) * 100)
        );
    }

    public static get zero(): Amount {
        return new Amount(0, 0);
    }

    public added(amount: Amount): Amount {
        const subunitValue = this.subunitValue + amount.subunitValue;
        const value = this.value + amount.value + Math.floor(subunitValue / 100);
        return new Amount(value, subunitValue % 100);
    }

    public multiplied(factor: number): Amount {
        const subunitValue = this.subunitValue * factor;
        const value = this.value * factor + Math.floor(subunitValue / 100);
        return new Amount(value, subunitValue % 100);
    }

    public get completeValue(): number {
        return this.value + this.subunitValue / 100;
    }

    public get flatten(): number {
        return this.completeValue;
    }
}

export namespace Amount {
    export const builder = new TypeBuilder<Flatten<Amount>, Amount>(Amount.from);
}
