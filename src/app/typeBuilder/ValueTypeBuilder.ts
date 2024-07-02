import type { ITypeBuilder } from './ITypeBuilder';

export class ValueTypeBuilder<T> implements ITypeBuilder<T, T> {

    public build(value: T): T {
        return value;
    }
}
