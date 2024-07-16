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
}
