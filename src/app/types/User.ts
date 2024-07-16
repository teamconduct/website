import { ValueTypeBuilder, ObjectTypeBuilder, TypeBuilder, ArrayTypeBuilder } from '../typeBuilder';
import { Dictionary, DictionaryTypeBuilder } from './Dictionary';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { PersonId } from './Person';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { TeamId } from './Team';
import { UserRole } from './UserRole';

export type UserId = Tagged<string, 'user'>;

export namespace UserId {
    export const builder = new TaggedTypeBuilder<string, UserId>('user', new ValueTypeBuilder());
}

export type User = {
    teams: Dictionary<TeamId, {
        name: string
        personId: PersonId
        roles: UserRole[]
    }>
}

export namespace User {
    export const builder = new ObjectTypeBuilder<Flatten<User>, User>({
        teams: new DictionaryTypeBuilder(new ObjectTypeBuilder({
            name: new ValueTypeBuilder(),
            personId: new TaggedTypeBuilder<string, PersonId>('person', new TypeBuilder(Guid.from)),
            roles: new ArrayTypeBuilder(new ValueTypeBuilder())
        }))
    });

    export function empty(): User {
        return {
            teams: new Dictionary()
        };
    }
}
