import { Fine, FineTemplate } from '@stevenkellner/team-conduct-api';
import { Sorting } from './Sorting';

export const fineTemplateListSorting = new Sorting<'reason' | 'amount', FineTemplate>('reason', {
    reason: {
        label: $localize `:Dropdown label to sort fine template by reason:Sort by reason`,
        icon: 'letters',
        defaultDirection: 'ascending'
    },
    amount: {
        label: $localize `:Dropdown label to sort fine template by amount:Sort by amount`,
        icon: 'numbers',
        defaultDirection: 'descending'
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
        compareFn: (lhs, rhs) => Fine.Amount.compare(lhs.amount, rhs.amount),
        fallbacks: ['reason']
    }
});
