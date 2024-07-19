import { BehaviorSubject, Observer, Subscription } from 'rxjs';

export class Observable<T> {

    private behaviorSubject: BehaviorSubject<T | null>;

    public constructor(initialValue: T | null = null) {
        this.behaviorSubject = new BehaviorSubject<T | null>(initialValue);
    }

    public get value(): T | null {
        return this.behaviorSubject.value;
    }

    public next(value: T) {
        this.behaviorSubject.next(value);
    }

    public error(error: any) {
        this.behaviorSubject.error(error);
    }

    public complete() {
        this.behaviorSubject.complete();
    }

    public subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription {
        return this.behaviorSubject.subscribe({
            next: value => {
                if (value !== null) {
                    if (typeof observerOrNext === 'function')
                        observerOrNext(value);
                    else if (typeof observerOrNext === 'object' && observerOrNext.next !== undefined)
                        observerOrNext.next(value);
                }

            },
            error: typeof observerOrNext === 'object' ? observerOrNext.error : undefined,
            complete: typeof observerOrNext === 'object' ? observerOrNext.complete : undefined
        });
    }

    public map<U>(transformFn: (value: T) => U): Observable<U> {
        const observable = new Observable<U>(this.value !== null ? transformFn(this.value) : null);
        this.subscribe({
            next: value => observable.next(transformFn(value)),
            error: error => observable.error(error),
            complete: () => observable.complete()
        });
        return observable;
    }
}

export function combine<T1, T2, U>(observable1: Observable<T1>, observable2: Observable<T2>, combine: (value1: T1, value2: T2) => U): Observable<U> {
    const combineWithNull = (value1: T1 | null, value2: T2 | null): U | null => {
        if (value1 === null || value2 === null)
            return null;
        return combine(value1, value2);
    };
    const observable = new Observable<U>(combineWithNull(observable1.value, observable2.value));
    observable1.subscribe({
        next: value1 => {
            const value2 = observable2.value;
            if (value2 !== null)
                observable.next(combine(value1, value2));
        },
        error: error => observable.error(error),
        complete: () => observable.complete()
    });
    observable2.subscribe({
        next: value2 => {
            const value1 = observable1.value;
            if (value1 !== null)
                observable.next(combine(value1, value2));
        },
        error: error => observable.error(error),
        complete: () => observable.complete()
    });
    return observable;
}
