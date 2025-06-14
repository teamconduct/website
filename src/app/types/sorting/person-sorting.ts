import { Sorting } from './Sorting';
import { PersonWithFines } from '../PersonWithFines';
import { SummedFineValue } from '../SummedFineValue';

export const personListSorting = new Sorting<'name' | 'payedState' | 'total' | 'notPayed', PersonWithFines>('name', {
    name: {
        label: $localize `:Dropdown label to sort persons by name:Sort by name`,
        direction: 'letters'
    },
    payedState: {
        label: $localize `:Dropdown label to sort persons by payed state:Sort by paid state`,
        direction: 'basic'

    },
    total: {
        label: $localize `:Dropdown label to sort persons by total amount:Sort by total amount`,
        direction: 'numbers'
    },
    notPayed: {
        label: $localize `:Dropdown label to sort persons by not payed amount:Sort by open amount`,
        direction: 'numbers'
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
            if (lhs.fineValues.payed.isZero && rhs.fineValues.payed.isZero)
                return 'equal';
            if (!lhs.fineValues.payed.isZero && !rhs.fineValues.payed.isZero)
                return 'equal';
            if (lhs.fineValues.payed.isZero)
                return 'greater';
            return 'less';
        },
        fallbacks: ['name']
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
