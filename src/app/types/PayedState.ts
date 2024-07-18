import { Tag } from 'primeng/tag';

export type PayedState =
    | 'payed'
    | 'notPayed';

export namespace PayedState {

    export function toggled(state: PayedState): PayedState {
        switch (state) {
        case 'payed':
            return 'notPayed';
        case 'notPayed':
            return 'payed';
        }
    }

    export function payedTag(state: PayedState): { value: string; severity: Tag['severity'] } {
        switch (state) {
        case 'payed':
            return {
                value: $localize `:Payed fine state:Paid`,
                severity: 'secondary'
            };
        case 'notPayed':
            return {
                value: $localize `:Unpayed fine state:Open`,
                severity: 'danger'
            };
        }
    }
}
