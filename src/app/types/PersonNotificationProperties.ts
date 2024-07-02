import { ValueTypeBuilder, ObjectTypeBuilder, ArrayTypeBuilder } from '../typeBuilder';
import { Sha512 } from '../utils/sha512';
import { Dictionary, DictionaryTypeBuilder } from './Dictionary';
import { Flatten } from './Flattable';
import { Tagged, TaggedTypeBuilder } from './Tagged';

export type TokenId = Tagged<string, 'notificationToken'>;

export namespace TokenId {

    export const builder = new TaggedTypeBuilder<string, TokenId>('notificationToken', new ValueTypeBuilder());

    export function create(token: string): TokenId {
        const rawId = new Sha512().hash(token).slice(0, 16);
        return new Tagged(rawId, 'notificationToken');
    }
}

export type NotificationSubscription =
    | 'new-fine'
    | 'fine-reminder'
    | 'fine-state-change';

export type PersonNotificationProperties = {
    tokens: Dictionary<TokenId, string>,
    subscriptions: NotificationSubscription[]
};

export namespace PersonNotificationProperties {

    export const builder = new ObjectTypeBuilder<Flatten<PersonNotificationProperties>, PersonNotificationProperties>({
        tokens: new DictionaryTypeBuilder(new ValueTypeBuilder()),
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });
}
