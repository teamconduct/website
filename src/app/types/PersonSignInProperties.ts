import { ArrayTypeBuilder, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { PersonNotificationProperties } from './PersonNotificationProperties';
import { UserId } from './User';
import { UserRole } from './UserRole';
import { UtcDate } from './UtcDate';

export type PersonSignInProperties = {
    userId: UserId
    signInDate: UtcDate
    notificationProperties: PersonNotificationProperties
    roles: UserRole[]
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: UserId.builder,
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationProperties: PersonNotificationProperties.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });
}
