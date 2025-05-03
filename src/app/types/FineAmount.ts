import { TypeBuilder } from '../typeBuilder';
import { UnionTypeBuilder } from '../typeBuilder/UnionTypeBuilder';
import { MoneyAmount } from './MoneyAmount';
import { Configuration } from './Configuration';
import { Flattable, Flatten } from './Flattable';

export type FineAmount =
    | FineAmount.Money
    | FineAmount.Item;

export namespace FineAmount {

    export class Money implements Flattable<{
        type: 'money',
        amount: Flatten<MoneyAmount>
    }> {

        public constructor(
            public amount: MoneyAmount
        ) {}

        public formatted(configuration: Configuration): string {
            return this.amount.formatted(configuration.currency);
        }

        public get flatten(): { type: 'money'; amount: Flatten<MoneyAmount>;} {
            return {
                type: 'money',
                amount: this.amount.flatten
            };
        }
    }

    export namespace Money {

        export const builder = new TypeBuilder<Flatten<Money>, Money>(value => new Money(MoneyAmount.builder.build(value.amount)));
    }

    export class Item implements Flattable<{
        type: 'item',
        item: Item.Type,
        count: number
    }> {

        public constructor(
            public item: Item.Type,
            public count: number
        ) {}

        public get flatten(): { type: 'item'; item: Item.Type; count: number; } {
            return {
                type: 'item',
                item: this.item,
                count: this.count
            };
        }
    }

    export namespace Item {

        export type Type =
            | 'crateOfBeer';

        export namespace Type {

            export const all: Type[] = ['crateOfBeer'];

            export function description(item: Type, plural: boolean = false): string {
                switch (item) {
                case 'crateOfBeer': return plural
                    ? $localize `:Fine value item description, crate of beer, plural:Crates of beer`
                    : $localize `:Fine value item description, crate of beer, singular:Crate of beer`;
                }
            }
        }

        export const builder = new TypeBuilder<Flatten<Item>, Item>(value => new Item(value.item, value.count));
    }

    export function money(amount: MoneyAmount): FineAmount.Money {
        return new Money(amount);
    }

    export function item(item: Item.Type, count: number): FineAmount.Item {
        return new Item(item, count);
    }

    export const builder = new UnionTypeBuilder<Flatten<FineAmount.Money>, Flatten<FineAmount.Item>, FineAmount.Money, FineAmount.Item>(value => value.type === 'money', Money.builder, Item.builder);

    export function compare(lhs: FineAmount, rhs: FineAmount): 'less' | 'equal' | 'greater' {
        if (lhs instanceof Money) {
            if (!(rhs instanceof Money))
                return 'greater';
            const lhsAmount = lhs.amount.completeValue;
            const rhsAmount = rhs.amount.completeValue;
            if (lhsAmount !== rhsAmount)
                return lhsAmount < rhsAmount ? 'less' : 'greater';
        }
        if (lhs instanceof Item) {
            if (!(rhs instanceof Item))
                return 'less';
            if (lhs.count === rhs.count)
                return 'equal';
            return lhs.count < rhs.count ? 'less' : 'greater';
        }
        return 'equal';
    }

    export function multiply(amount: FineAmount, factor: number): FineAmount {
        if (amount instanceof Money)
            return FineAmount.money(amount.amount.multiplied(factor));
        return FineAmount.item(amount.item, amount.count * factor);
    }
}
