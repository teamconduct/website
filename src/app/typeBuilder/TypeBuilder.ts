import type { ITypeBuilder } from './ITypeBuilder';

export class TypeBuilder<V, T> implements ITypeBuilder<V, T> {

    public constructor(
        public readonly _build: (value: V) => T
    ) {}

    public build(value: V): T {
        return this._build(value);
    }
}
