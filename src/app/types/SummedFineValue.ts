import { Currency, Fine, Locale, Money } from '@stevenkellner/team-conduct-api';
import { values, keys } from '@stevenkellner/typescript-common-functionality';

export class SummedFineValue {

    public constructor(
        public items: Record<Fine.Amount.Item.Type, number> = {
            'crateOfBeer': 0
        },
        public amount = Money.zero
    ) {}

    private addFineAmount(fineAmount: Fine.Amount) {
        if (fineAmount instanceof Fine.Amount.Money)
            this.amount = this.amount.added(fineAmount.amount);
        else if (fineAmount instanceof Fine.Amount.Item)
            this.items[fineAmount.item] += fineAmount.count;
    }

    private addSummedFineValue(summedFineValue: SummedFineValue) {
        this.amount = this.amount.added(summedFineValue.amount);
        for (const item of keys(summedFineValue.items))
            this.items[item] += summedFineValue.items[item];
    }

    public add(fineAmount: Fine.Amount | SummedFineValue) {
        if (fineAmount instanceof SummedFineValue)
            this.addSummedFineValue(fineAmount);
        else
            this.addFineAmount(fineAmount);
    }

    public added(fineAmount: Fine.Amount | SummedFineValue): SummedFineValue {
        const newValue = new SummedFineValue(this.items, this.amount);
        newValue.add(fineAmount);
        return newValue;
    }

    public get isZero(): boolean {
        if (this.amount.completeValue !== 0)
            return false;
        return values(this.items).every(count => count === 0);
    }

    public formatted(currency: Currency, locale: Locale): string {
        const parts: string[] = [];
        if (this.amount.completeValue !== 0)
            parts.push(this.amount.formatted(currency, locale));
        for (const item of keys(this.items)) {
            const count = this.items[item];
            if (count !== 0)
                parts.push(new Fine.Amount.Item(item, count).formatted(currency, locale));
        }
        return parts.join(', ');
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
