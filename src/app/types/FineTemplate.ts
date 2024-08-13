import { FineTemplateMultiple } from './FineTemplateMultiple';
import { TypeBuilder, ObjectTypeBuilder, ValueTypeBuilder, OptionalTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { FineValue } from './FineValue';

export type FineTemplateId = Tagged<Guid, 'fineTemplate'>;

export namespace FineTemplateId {
    export const builder = new TaggedTypeBuilder<string, FineTemplateId>('fineTemplate', new TypeBuilder(Guid.from));
}

export type FineTemplate = {
    id: FineTemplateId,
    reason: string,
    value: FineValue,
    multiple: FineTemplateMultiple | null
}

export namespace FineTemplate {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplate>, FineTemplate>({
        id: FineTemplateId.builder,
        reason: new ValueTypeBuilder(),
        value: FineValue.builder,
        multiple: new OptionalTypeBuilder(FineTemplateMultiple.builder)
    });
}
