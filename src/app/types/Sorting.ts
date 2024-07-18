import { faArrowDown19, faArrowDown91, faArrowDownAZ, faArrowDownShortWide, faArrowDownWideShort, faArrowDownZA, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { entries } from '../utils';

export class Sorting<Key extends string, T> {

    public sortBy: Key;

    public direction: 'ascending' | 'descending' = 'ascending';

    private directionIcons = {
        letters: {
            ascending: faArrowDownAZ,
            descending: faArrowDownZA
        },
        numbers: {
            ascending: faArrowDown19,
            descending: faArrowDown91
        },
        basic: {
            ascending: faArrowDownWideShort,
            descending: faArrowDownShortWide
        }
    };

    public constructor(
        private readonly initialKey: Key,
        private readonly labels: Record<Key, { label: string, direction: 'letters' | 'numbers' | 'basic' }>,
        private readonly sorting: Record<Key, {
            compareFn: (lhs: T, rhs: T) => 'less' | 'equal' | 'greater',
            fallbacks: Key[]
        }>
    ) {
        this.sortBy = this.initialKey;
    }

    public get options(): { key: Key, label: string }[] {
        return entries(this.labels)
            .map(({ key, value }) => ({ key: key, label: value.label }))
            .sort((lhs, rhs) => lhs.key === this.initialKey ? -1 : rhs.key === this.initialKey ? 1 : 0);
    }

    public get directionIcon(): IconDefinition {
        return this.directionIcons[this.labels[this.sortBy].direction][this.direction];
    }

    public toggleDirection() {
        this.direction = this.direction === 'ascending' ? 'descending' : 'ascending';
    }

    public sort(list: T[]) {
        list.sort((lhs, rhs) => {
            let compared = this.sorting[this.sortBy].compareFn(lhs, rhs);
            for (const fallback of this.sorting[this.sortBy].fallbacks) {
                if (compared !== 'equal')
                    break;
                compared = this.sorting[fallback].compareFn(lhs, rhs);
            }
            const sortValue = compared === 'equal' ? 0 : compared === 'less' ? -1 : 1;
            return this.direction === 'ascending' ? sortValue : -sortValue;
        });
    }
}
