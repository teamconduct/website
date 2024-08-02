import { PersonPrivateProperties } from './PersonPrivateProperties';
import { PersonSignInProperties } from './PersonSignInProperties';
import { Fine, FineId } from './Fine';
import { ArrayTypeBuilder, ObjectTypeBuilder, OptionalTypeBuilder, TypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { Guid } from './Guid';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { Amount } from './Amount';

export type PersonId = Tagged<Guid, 'person'>;

export namespace PersonId {
    export const builder = new TaggedTypeBuilder<string, PersonId>('person', new TypeBuilder(Guid.from));
}

export type Person = {
    id: PersonId,
    properties: PersonPrivateProperties,
    fineIds: FineId[],
    signInProperties: PersonSignInProperties | null
}

export namespace Person {

    export const builder = new ObjectTypeBuilder<Flatten<Person>, Person>({
        id: PersonId.builder,
        properties: PersonPrivateProperties.builder,
        fineIds: new ArrayTypeBuilder(FineId.builder),
        signInProperties: new OptionalTypeBuilder(PersonSignInProperties.builder)
    });

    export function name(person: { properties: Person['properties'] }): string {
        if (person.properties.lastName === null)
            return person.properties.firstName;
        return `${person.properties.firstName} ${person.properties.lastName}`;
    }
}

export type PersonWithFines = Omit<Person, 'fineIds'> & {
    fines: Fine[],
    amounts: {
        total: Amount,
        payed: Amount,
        notPayed: Amount
    }
};
