import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { UnionTypeBuilder } from '../typeBuilder/UnionTypeBuilder';
import { Amount } from './Amount';
import { Flatten } from './Flattable';

export type FineValueItem =
    | 'crateOfBeer';

export type FineValue =
    | FineValue._Amount
    | FineValue.Item;

export namespace FineValueItem {

    export const all: FineValueItem[] = [
        'crateOfBeer'
    ];

    export function description(item: FineValueItem, plural: boolean = false): string {
        switch (item) {
        case 'crateOfBeer': return plural
            ? $localize `:Fine value item description, crate of beer, plural:Crates of beer`
            : $localize `:Fine value item description, crate of beer, singular:Crate of beer`;
        }
    }
}

export namespace FineValue {

    export function amount(amount: Amount): FineValue._Amount {
        return {
            type: 'amount',
            amount: amount
        };
    }

    export function item(item: FineValueItem, count: number): FineValue.Item {
        return {
            type: 'item',
            item: item,
            count: count
        };
    }

    export type _Amount = {
        type: 'amount',
        amount: Amount
    }

    export type Item ={
        type: 'item',
        item: FineValueItem,
        count: number
    }

    const amountBuilder = new ObjectTypeBuilder<Flatten<FineValue._Amount>, FineValue._Amount>({
        type: new ValueTypeBuilder(),
        amount: Amount.builder
    });

    const itemBuilder = new ObjectTypeBuilder<Flatten<FineValue.Item>, FineValue.Item>({
        type: new ValueTypeBuilder(),
        item: new ValueTypeBuilder(),
        count: new ValueTypeBuilder()
    });

    export const builder = new UnionTypeBuilder<Flatten<FineValue._Amount>, Flatten<FineValue.Item>, FineValue._Amount, FineValue.Item>(value => value.type === 'amount', amountBuilder, itemBuilder);

    export function compare(lhs: FineValue, rhs: FineValue): 'less' | 'equal' | 'greater' {
        if (lhs.type === 'amount') {
            if (rhs.type !== 'amount')
                return 'greater';
            const lhsAmount = lhs.amount.completeValue;
            const rhsAmount = rhs.amount.completeValue;
            if (lhsAmount !== rhsAmount)
                return lhsAmount < rhsAmount ? 'less' : 'greater';
        }
        if (lhs.type === 'item') {
            if (rhs.type !== 'item')
                return 'less';
            if (lhs.count === rhs.count)
                return 'equal';
            return lhs.count < rhs.count ? 'less' : 'greater';
        }
        return 'equal';
    }

    export function multiply(amount: FineValue, factor: number): FineValue {
        if (amount.type === 'amount') {
            return FineValue.amount(amount.amount.multiplied(factor));
        }
        return FineValue.item(amount.item, amount.count * factor);
    }
}
