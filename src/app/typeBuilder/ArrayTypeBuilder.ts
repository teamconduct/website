import type { ITypeBuilder } from './ITypeBuilder';

export class ArrayTypeBuilder<V, T> implements ITypeBuilder<V[], T[]> {

    public constructor(
        private readonly builder: ITypeBuilder<V, T>
    ) {}

    public build(value: V[]): T[] {
        return value.map(element => this.builder.build(element));
    }
}
