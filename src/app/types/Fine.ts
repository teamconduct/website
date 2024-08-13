import { TypeBuilder, ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { FineValue } from './FineValue';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { PayedState } from './PayedState';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { UtcDate } from './UtcDate';

export type FineId = Tagged<Guid, 'fine'>;

export namespace FineId {
    export const builder = new TaggedTypeBuilder<string, FineId>('fine', new TypeBuilder(Guid.from));
}

export type Fine = {
    id: FineId
    payedState: PayedState,
    date: UtcDate,
    reason: string,
    value: FineValue
}

export namespace Fine {
    export const builder = new ObjectTypeBuilder<Flatten<Fine>, Fine>({
        id: FineId.builder,
        payedState: new ValueTypeBuilder(),
        date: new TypeBuilder(UtcDate.decode),
        reason: new ValueTypeBuilder(),
        value: FineValue.builder
    });
}
