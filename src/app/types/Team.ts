import { TypeBuilder, ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { Tagged, TaggedTypeBuilder } from './Tagged';

export type TeamId = Tagged<Guid, 'team'>;

export namespace TeamId {
    export const builder = new TaggedTypeBuilder<string, TeamId>('team', new TypeBuilder(Guid.from));
}

export type Team = {
    id: TeamId,
    name: string,
    paypalMeLink: string | null
}

export namespace Team {
    export const builder = new ObjectTypeBuilder<Flatten<Team>, Team>({
        id: TeamId.builder,
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder()
    });
}
