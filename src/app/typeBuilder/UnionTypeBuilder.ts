import { ITypeBuilder } from "./ITypeBuilder";

export class UnionTypeBuilder<V1, V2, T1, T2> implements ITypeBuilder<V1 | V2, T1 | T2> {

    public constructor(
        private readonly isFirstType: (value: V1 | V2) => value is V1,
        private readonly builder1: ITypeBuilder<V1, T1>,
        private readonly builder2: ITypeBuilder<V2, T2>
    ) {}

    public build(value: V1 | V2): T1 | T2 {
        if (this.isFirstType(value))
            return this.builder1.build(value);
        else
            return this.builder2.build(value);
    }
}
