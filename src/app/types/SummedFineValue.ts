import { FineAmount, MoneyAmount } from '@stevenkellner/team-conduct-api';
import { values, keys } from '@stevenkellner/typescript-common-functionality';

export class SummedFineValue {

    public items: Record<FineAmount.Item.Type, number> = {
        'crateOfBeer': 0
    };

    public amount = MoneyAmount.zero;

    public add(fineAmount: FineAmount) {
        if (fineAmount instanceof FineAmount.Money)
            this.amount = this.amount.added(fineAmount.amount);
        else if (fineAmount instanceof FineAmount.Item)
            this.items[fineAmount.item] += fineAmount.count;
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
