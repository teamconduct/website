import { Dictionary } from './Dictionary';

export class DataStorage<Id, T> {

    private data: Dictionary<Id, T> | null = null;

    public get(key: Id): T {
        if (this.data === null)
            throw new Error('DataStorage not initialized');
        return this.data.get(key as any);
    }

    public has(key: Id): boolean {
        if (this.data === null)
            return false;
        return this.data.has(key as any);
    }

    public map<U>(callbackFn: (value: T, key: string) => U): U[] | null {
        if (this.data === null)
            return null;
        return this.data.entries.map(({ key, value }) => callbackFn(value, key));
    }

    public flatMap<U>(callbackFn: (value: T, key: string) => U[]): U[] | null {
        if (this.data === null)
            return null;
        return this.data.entries.flatMap(({ key, value }) => callbackFn(value, key));
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
        return this.data.entries.reduce((previousValue, { key, value }) => callbackFn(previousValue, value, key), initialValue);
    }
}
