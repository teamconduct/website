import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId } from '../../types';
import { NotificationSubscription } from '../../types/PersonNotificationProperties';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const notificationSubscribeFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    subscriptions: NotificationSubscription[]
}, void>(new ValueTypeBuilder<null>());
