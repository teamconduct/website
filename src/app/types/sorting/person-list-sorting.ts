import { Sorting } from './Sorting';
import { PersonWithFines } from '../PersonWithFines';
import { SummedFineValue } from '../SummedFineValue';

export const personListSorting = new Sorting<'name' | 'payedState' | 'total' | 'notPayed', PersonWithFines>('name', {
    name: {
        label: $localize `:Dropdown label to sort persons by name:Sort by name`,
        icon: 'letters',
        defaultDirection: 'ascending'
    },
    payedState: {
        label: $localize `:Dropdown label to sort persons by payed state:Sort by paid state`,
        icon: 'basic',
        defaultDirection: 'descending'
    },
    total: {
        label: $localize `:Dropdown label to sort persons by total amount:Sort by total amount`,
        icon: 'numbers',
        defaultDirection: 'descending'
    },
    notPayed: {
        label: $localize `:Dropdown label to sort persons by not payed amount:Sort by open amount`,
        icon: 'numbers',
        defaultDirection: 'descending'
    }
}, {
    name: {
        compareFn: (lhs, rhs) => {
            const lhsName = (lhs.properties.lastName === null ? lhs.properties.firstName : `${lhs.properties.firstName} ${lhs.properties.lastName}`).toUpperCase();
            const rhsName = (rhs.properties.lastName === null ? rhs.properties.firstName : `${rhs.properties.firstName} ${rhs.properties.lastName}`).toUpperCase();
            if (lhsName === rhsName)
                return 'equal';
            return lhsName < rhsName ? 'less' : 'greater';
        },
        fallbacks: []
    },
    payedState: {
        compareFn: (lhs, rhs) => {
            if (lhs.fineValues.notPayed.isZero && rhs.fineValues.notPayed.isZero)
                return 'equal';
            if (!lhs.fineValues.notPayed.isZero && !rhs.fineValues.notPayed.isZero)
                return 'equal';
            if (lhs.fineValues.notPayed.isZero)
                return 'less';
            return 'greater';
        },
        fallbacks: ['notPayed', 'total', 'name']
    },
    total: {
        compareFn: (lhs, rhs) => SummedFineValue.compare(lhs.fineValues.total, rhs.fineValues.total),
        fallbacks: ['name']
    },
    notPayed: {
        compareFn: (lhs, rhs) => SummedFineValue.compare(lhs.fineValues.notPayed, rhs.fineValues.notPayed),
        fallbacks: ['name']
    }
});
