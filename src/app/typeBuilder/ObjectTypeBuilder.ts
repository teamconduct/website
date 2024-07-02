import { mapRecord } from '../utils';
import type { ITypeBuilder } from './ITypeBuilder';

export class ObjectTypeBuilder<
    V extends { [K in string]: unknown },
    T extends { [K in keyof V]: unknown }
> implements ITypeBuilder<V, T> {

    public constructor(
        private readonly builders: { [K in keyof V]: ITypeBuilder<V[K], T[K]> }
    ) {}

    public build(value: V): T {
        return mapRecord(this.builders, (builder, key) => builder.build(value[key])) as T;
    }
}
