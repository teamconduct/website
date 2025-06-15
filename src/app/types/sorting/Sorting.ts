import { faArrowDown19, faArrowUp91, faArrowDownAZ, faArrowUpShortWide, faArrowDownWideShort, faArrowUpZA } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/angular-fontawesome';
import { entries } from '@stevenkellner/typescript-common-functionality';

export class Sorting<Key extends string, T> {

    private sortBy: Key;

    public direction: 'ascending' | 'descending' = 'ascending';

    private directionIcons = {
        letters: {
            ascending: faArrowDownAZ,
            descending: faArrowUpZA
        },
        numbers: {
            ascending: faArrowDown19,
            descending: faArrowUp91
        },
        basic: {
            ascending: faArrowDownWideShort,
            descending: faArrowUpShortWide
        }
    };

    public constructor(
        private readonly initialKey: Key,
        private readonly labels: Record<Key, { label: string, icon: 'letters' | 'numbers' | 'basic', defaultDirection: 'ascending' | 'descending' }>,
        private readonly sorting: Record<Key, {
            compareFn: (lhs: T, rhs: T) => 'less' | 'equal' | 'greater',
            fallbacks: Key[]
        }>
    ) {
        this.sortBy = initialKey;
        this.direction = this.labels[initialKey].defaultDirection;
    }

    public set sortByKey(key: Key) {
        this.sortBy = key;
        this.direction = this.labels[key].defaultDirection;
    }

    public get sortByKey(): Key {
        return this.sortBy;
    }

    public get options(): { key: Key, label: string }[] {
        return entries(this.labels)
            .map(({ key, value }) => ({ key: key, label: value.label }))
            .sort((lhs, rhs) => lhs.key === this.initialKey ? -1 : rhs.key === this.initialKey ? 1 : 0);
    }

    public get directionIcon(): IconDefinition {
        return this.directionIcons[this.labels[this.sortBy].icon][this.direction];
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
