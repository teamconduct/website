export interface ITypeBuilder<V, T> {

    build(value: V): T;
}
