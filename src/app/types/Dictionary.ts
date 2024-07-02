import type { ITypeBuilder } from '../typeBuilder';
import { Flattable, type Flatten } from './Flattable';
import { entries, keys, mapRecord, values } from '../utils/record';

export class Dictionary<K, T> implements Flattable<Record<string, T>> {

    public constructor(
        private readonly dictionary: Record<string, T> = {}
    ) {}

    public get(key: Flatten<K> extends string ? K : never): T {
        return this.dictionary[Flattable.flatten(key) as string];
    }

    public set(key: Flatten<K> extends string ? K : never, value: T): void {
        this.dictionary[Flattable.flatten(key) as string] = value;
    }

    public has(key: Flatten<K> extends string ? K : never): boolean {
        return Flattable.flatten(key) as string in this.dictionary;
    }

    public get keys(): string[] {
        return keys(this.dictionary);
    }

    public get values(): T[] {
        return values(this.dictionary);
    }

    public get entries(): { key: string; value: T }[] {
        return entries(this.dictionary);
    }

    public map<U>(callbackFn: (value: T, key: string) => U): Dictionary<K, U> {
        return new Dictionary(mapRecord(this.dictionary, callbackFn));
    }

    public get flatten(): Record<string, T> {
        return this.dictionary;
    }
}

export class DictionaryTypeBuilder<V, K, T> implements ITypeBuilder<Record<string, V>, Dictionary<K, T>> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: Record<string, V>): Dictionary<K, T> {
        return new Dictionary(mapRecord(value, value => this.builder.build(value)));
    }
}
