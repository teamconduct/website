import { Dictionary, Flattable } from '@stevenkellner/typescript-common-functionality';

export class DataStorage<Id extends string | Flattable<string>, T> {

    private data: Dictionary<Id, T> | null = null;

    public get(key: Id): T {
        if (this.data === null)
            throw new Error('DataStorage not initialized');
        return this.data.get(key);
    }

    public has(key: Id): boolean {
        if (this.data === null)
            return false;
        return this.data.has(key);
    }

    public map<U>(callbackFn: (value: T, key: string) => U): U[] | null {
        if (this.data === null)
            return null;
        return this.data.entries.map(({ key, value }) => {
            const stringKey = typeof key === 'string' ? key : key.flatten;
            return callbackFn(value, stringKey);
        });
    }

    public flatMap<U>(callbackFn: (value: T, key: string) => U[]): U[] | null {
        if (this.data === null)
            return null;
        return this.data.entries.flatMap(({ key, value }) => {
            const stringKey = typeof key === 'string' ? key : key.flatten;
            return callbackFn(value, stringKey);
        });
    }

    public compactMap<U>(callbackFn: (value: T, key: string) => U | null): U[] | null {
        return this.flatMap((value, key) => {
            const result = callbackFn(value, key);
            return result === null ? [] : [result];
        });
    }

    public reduce<U>(initialValue: U, callbackFn: (previousValue: U, value: T, key: string) => U): U | null {
        if (this.data === null)
            return null;
        return this.data.entries.reduce((previousValue, { key, value }) => {
            const stringKey = typeof key === 'string' ? key : key.flatten;
            return callbackFn(previousValue, value, stringKey);
        }, initialValue);
    }
}
