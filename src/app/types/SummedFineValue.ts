import { keys, values } from '../utils';
import { Amount } from './Amount';
import { FineValue, FineValueItem } from './FineValue';

export class SummedFineValue {

    public items: Record<FineValueItem, number> = {
        'crateOfBeer': 0
    };

    public amount = Amount.zero;

    public add(fineValue: FineValue) {
        switch (fineValue.type) {
        case 'amount':
            this.amount = this.amount.added(fineValue.amount);
            break;
        case 'item':
            this.items[fineValue.item] += fineValue.count;
            break;
        }
    }

    public get isZero(): boolean {
        if (this.amount.completeValue !== 0)
            return false;
        return values(this.items).every(count => count === 0);
    }
}

export namespace SummedFineValue {

    export function compare(lhs: SummedFineValue, rhs: SummedFineValue): 'less' | 'equal' | 'greater' {
        const lhsAmount = lhs.amount.completeValue;
        const rhsAmount = rhs.amount.completeValue;
        if (lhsAmount !== rhsAmount)
            return lhsAmount < rhsAmount ? 'less' : 'greater';
        for (const item of keys(lhs.items)) {
            if (lhs.items[item] !== rhs.items[item])
                return lhs.items[item] < rhs.items[item] ? 'less' : 'greater';
        }
        return 'equal';
    }
}
