import { Fine, FineAmount } from '@stevenkellner/team-conduct-api';
import { Sorting } from './Sorting';

export const fineListSorting = new Sorting<'reason' | 'payed' | 'date' | 'amount', Fine>('payed', {
    reason: {
        label: $localize `:Dropdown label to sort fine by reason:Sort by reason`,
        icon: 'letters',
        defaultDirection: 'ascending'
    },
    payed: {
        label: $localize `:Dropdown label to sort fine by payed state:Sort by paid state`,
        icon: 'basic',
        defaultDirection: 'ascending'
    },
    date: {
        label: $localize `:Dropdown label to sort fine by date:Sort by date`,
        icon: 'basic',
        defaultDirection: 'ascending'
    },
    amount: {
        label: $localize `:Dropdown label to sort fine by amount:Sort by amount`,
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
    payed: {
        compareFn: (lhs, rhs) => {
            if (lhs.payedState === rhs.payedState)
                return 'equal';
            if (lhs.payedState === 'notPayed')
                return 'less';
            return 'greater';
        },
        fallbacks: ['date', 'reason']
    },
    date: {
        compareFn: (lhs, rhs) => {
            const value = lhs.date.compare(rhs.date);
            if (value === 'equal')
                return 'equal';
            return value === 'less' ? 'greater' : 'less';
        },
        fallbacks: ['reason']
    },
    amount: {
        compareFn: (lhs, rhs) => FineAmount.compare(lhs.amount, rhs.amount),
        fallbacks: ['reason']
    }
});
