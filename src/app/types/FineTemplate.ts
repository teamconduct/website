import { FineTemplateRepetition } from './FineTemplateRepetition';
import { TypeBuilder, ObjectTypeBuilder, ValueTypeBuilder, OptionalTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { FineAmount } from './FineAmount';

export type FineTemplateId = Tagged<Guid, 'fineTemplate'>;

export namespace FineTemplateId {
    export const builder = new TaggedTypeBuilder<string, FineTemplateId>('fineTemplate', new TypeBuilder(Guid.from));
}

export type FineTemplate = {
    id: FineTemplateId,
    reason: string,
    amount: FineAmount,
    repetition: FineTemplateRepetition | null
}

export namespace FineTemplate {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplate>, FineTemplate>({
        id: FineTemplateId.builder,
        reason: new ValueTypeBuilder(),
        amount: FineAmount.builder,
        repetition: new OptionalTypeBuilder(FineTemplateRepetition.builder)
    });
}
