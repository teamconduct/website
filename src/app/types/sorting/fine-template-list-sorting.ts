import { FineAmount, FineTemplate } from '@stevenkellner/team-conduct-api';
import { Sorting } from './Sorting';

export const fineTemplateListSorting = new Sorting<'reason' | 'amount', FineTemplate>('reason', {
    reason: {
        label: $localize `:Dropdown label to sort fine template by reason:Sort by reason`,
        direction: 'letters'
    },
    amount: {
        label: $localize `:Dropdown label to sort fine template by amount:Sort by amount`,
        direction: 'numbers'
    }
}, {
    reason: {
        compareFn: (lhs, rhs) => {
            const lhsReason = lhs.reason.toUpperCase();
            const rhsReason = rhs.reason.toUpperCase();
            if (lhsReason === rhsReason)
                return 'equal';
            return lhsReason < rhsReason ? 'less' : 'greater';
        },
        fallbacks: []
    },
    amount: {
        compareFn: (lhs, rhs) => FineAmount.compare(lhs.amount, rhs.amount),
        fallbacks: ['reason']
    }
});
