import { Fine, Person, PersonPrivateProperties, PersonSignInProperties } from '@stevenkellner/team-conduct-api';
import { SummedFineValue } from './SummedFineValue';

export class PersonWithFines {

    public constructor(
        public id: Person.Id,
        public properties: PersonPrivateProperties,
        public signInProperties: PersonSignInProperties | null,
        public fines: Fine[],
        public fineValues: {
            total: SummedFineValue,
            payed: SummedFineValue,
            notPayed: SummedFineValue
        }
    ) {}

    public get person(): Person {
        return new Person(
            this.id,
            this.properties,
            this.fines.map(fine => fine.id),
            this.signInProperties
        );
    }

    public get name(): string {
        return this.person.name;
    }
}
