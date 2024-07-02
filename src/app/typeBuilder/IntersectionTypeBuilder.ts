import type { ITypeBuilder } from './ITypeBuilder';

export class IntersectionTypeBuilder<V1, V2, T1, T2> implements ITypeBuilder<V1 & V2, T1 & T2> {

    public constructor(
        private readonly builder1: ITypeBuilder<V1, T1>,
        private readonly builder2: ITypeBuilder<V2, T2>

    ) {}

    public build(value: V1 & V2): T1 & T2 {
        return {
            ...this.builder1.build(value),
            ...this.builder2.build(value)
        };
    }
}
