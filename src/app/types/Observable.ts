import { BehaviorSubject } from 'rxjs';

export class Observable<T> extends BehaviorSubject<T | null> {

    public constructor(initialValue: T | null = null) {
        super(initialValue);
    }

    public map<U>(transformFn: (value: T) => U): Observable<U> {
        const transform = (value: T | null) => value !== null ? transformFn(value) : null;
        const observable = new Observable<U>(transform(this.value));
        this.subscribe({
            next: value => observable.next(transform(value)),
            error: error => observable.error(error),
            complete: () => observable.complete()
        });
        return observable;
    }
}

export function combine<T1, T2, U>(observable1: Observable<T1>, observable2: Observable<T2>, combineFn: (value1: T1, value2: T2) => U): Observable<U> {
    const combine = (value1: T1 | null, value2: T2 | null) => (value1 !== null && value2 !== null) ? combineFn(value1, value2) : null;
    const observable = new Observable<U>(combine(observable1.value, observable2.value));
    observable1.subscribe({
        next: value => observable.next(combine(value, observable2.value)),
        error: error => observable.error(error),
        complete: () => observable.complete()
    });
    observable2.subscribe({
        next: value => observable.next(combine(observable1.value, value)),
        error: error => observable.error(error),
        complete: () => observable.complete()
    });
    return observable;
}
