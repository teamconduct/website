import { ITypeBuilder } from '../typeBuilder';
import type { Flattable } from './Flattable';
import { Guid } from './Guid';

export class Tagged<T, Tag> implements Flattable<T> {

    public constructor(
        public readonly value: T,
        public readonly tag: Tag
    ) {}

    public get flatten(): T {
        return this.value;
    }

    public static generate<Tag>(tag: Tag): Tagged<Guid, Tag> {
        return new Tagged(Guid.generate(), tag);
    }

    public get guidString(): T extends Guid ? string : never {
        return (this.value as Guid).guidString as T extends Guid ? string : never;
    }
}

export namespace Tagged {

    export type TypeOf<T extends Tagged<any, any>> = T extends Tagged<infer V, any> ? V : never;

    export type TagOf<T extends Tagged<any, any>> = T extends Tagged<any, infer Tag> ? Tag : never;
}

export class TaggedTypeBuilder<V, T extends Tagged<any, any>> implements ITypeBuilder<V, T> {

    public constructor(
        private readonly tag: Tagged.TagOf<T>,
        private readonly builder: ITypeBuilder<V, Tagged.TypeOf<T>>
    ) { }

    public build(value: V): T {
        return new Tagged(this.builder.build(value), this.tag) as T;
    }
}
