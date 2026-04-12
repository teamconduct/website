import { Fine, PayedState, Person } from '@stevenkellner/team-conduct-api';
import { SummedFineValue } from './SummedFineValue';

export class PersonWithFines extends Person {

    public fineValues: {
        total: SummedFineValue,
        payed: SummedFineValue,
        notPayed: SummedFineValue
    }

    public constructor(
        person: Person,
        public fines: Fine[],
    ) {
        super(
            person.id,
            person.properties,
            person.fineIds,
            person.signInProperties
        );
        this.fineValues = fines.reduce((fineValues, fine) => {
            fineValues.total.add(fine.amount);
            if (fine.payedState instanceof PayedState.Payed)
                fineValues.payed.add(fine.amount);
            if (fine.payedState instanceof PayedState.NotPayed)
                fineValues.notPayed.add(fine.amount);
            return fineValues;
        }, { total: new SummedFineValue(), payed: new SummedFineValue(), notPayed: new SummedFineValue() })
    }

    public get person(): Person {
        return new Person(
            this.id,
            this.properties,
            this.fineIds,
            this.signInProperties
        );
    }
}
