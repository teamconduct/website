import { ObjectTypeBuilder, TypeBuilder } from '../typeBuilder';
import { Dictionary } from './Dictionary';
import { Flatten } from './Flattable';
import { PersonNotificationProperties } from './PersonNotificationProperties';
import { UserId } from './User';
import { UtcDate } from './UtcDate';

export type PersonSignInProperties = {
    userId: UserId
    signInDate: UtcDate,
    notificationProperties: PersonNotificationProperties
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: UserId.builder,
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationProperties: PersonNotificationProperties.builder
    });

    export function empty(userId: UserId): PersonSignInProperties {
        return {
            userId,
            signInDate: UtcDate.now,
            notificationProperties: {
                tokens: new Dictionary(),
                subscriptions: []
            }
        };
    }
}
