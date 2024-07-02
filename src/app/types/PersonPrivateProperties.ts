import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';

export type PersonPrivateProperties = {
    firstName: string
    lastName: string | null
}

export namespace PersonPrivateProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonPrivateProperties>, PersonPrivateProperties>({
        firstName: new ValueTypeBuilder(),
        lastName: new ValueTypeBuilder()
    });
}
