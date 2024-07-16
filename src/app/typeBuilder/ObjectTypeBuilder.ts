import { mapRecord } from '../utils';
import type { ITypeBuilder } from './ITypeBuilder';

export class ObjectTypeBuilder<
    V extends { [K in keyof T]: unknown },
    T extends { [K in string]: unknown }
> implements ITypeBuilder<V, T> {

    public constructor(
        private readonly builders: { [K in keyof T]: ITypeBuilder<V[K], T[K]> }
    ) {}

    public build(value: V): T {
        return mapRecord(this.builders, (builder, key) => builder.build(value[key])) as T;
    }
}
