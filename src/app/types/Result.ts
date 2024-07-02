export type Result<T, E> = Result.Success<T> | Result.Failure<E>;

export namespace Result {

    export type Value<R> = R extends Result<infer T, unknown> ? T : never;

    export type Error<R> = R extends Result<unknown, infer E> ? E : never;

    export class Success<T> {
        public readonly state = 'success';

        public constructor(
            public readonly value: T
        ) {}

        // eslint-disable-next-line @typescript-eslint/class-literal-property-style
        public get error(): null {
            return null;
        }

        public get valueOrError(): T {
            return this.value;
        }

        public get(): T {
            return this.value;
        }

        public map<T2>(mapper: (value: T) => T2): Result<T2, never> {
            return new Result.Success<T2>(mapper(this.value));
        }

        public mapError(): Result<T, never> {
            return this;
        }
    }

    export class Failure<E> {
        public readonly state = 'failure';

        public constructor(
            public readonly error: E
        ) {}

        // eslint-disable-next-line @typescript-eslint/class-literal-property-style
        public get value(): null {
            return null;
        }

        public get valueOrError(): E {
            return this.error;
        }

        public get(): never {
            throw this.error;
        }

        public map(): Result<never, E> {
            return this;
        }

        public mapError<E2>(mapper: (value: E) => E2): Result<never, E2> {
            return new Result.Failure<E2>(mapper(this.error));
        }
    }

    export function success<T>(value: T): Result<T, never>;
    export function success(): Result<void, never>;
    export function success<T>(value?: T): Result<T | void, never> {
        return new Result.Success<T | void>(value);
    }

    export function failure<E>(error: E): Result<never, E> {
        return new Result.Failure<E>(error);
    }

    export function isSuccess<T, E>(result: Result<T, E>): result is Result.Success<T> {
        return result.state === 'success';
    }

    export function isFailure<T, E>(result: Result<T, E>): result is Result.Failure<E> {
        return result.state === 'failure';
    }

    export function from<T = unknown, E = unknown>(value: unknown): Result<T, E> {
        if (typeof value !== 'object' || value === null)
            throw new Error('Expected an object');
        if (!('state' in value))
            throw new Error('Expected a state property');
        if (value.state === 'success') {
            if (!('value' in value))
                throw new Error('Expected a value property');
            return success(value.value as T);
        }
        if (value.state === 'failure') {
            if (!('error' in value))
                throw new Error('Expected an error property');
            return failure(value.error as E);
        }
        throw new Error('Expected a state property with value success or failure');
    }
}
