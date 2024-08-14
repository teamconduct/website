import { inject, Injectable } from '@angular/core';
import { FirebaseFunctionsService } from './firebase-functions.service';
import { UserManagerService } from './user-manager.service';
import { NotificationSubscription } from '../types/PersonNotificationProperties';
import { getToken, Messaging, NotificationPayload, onMessage } from '@angular/fire/messaging';
import { Subject } from 'rxjs';
import { TeamId } from '../types/Team';
import { PersonId } from '../types';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private userManager = inject(UserManagerService);

    private messaging = inject(Messaging);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private async requestPermission(): Promise<string | null> {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted')
            return null;
        const registration = await navigator.serviceWorker.register('/assets/firebase-messaging-sw.js', { type: 'module' });
        return await getToken(this.messaging, { serviceWorkerRegistration: registration });
    }

    public async register(teamId: TeamId, personId: PersonId): Promise<Subject<NotificationPayload> | null> {
        const token = await this.requestPermission();
        if (token === null)
            return null;
        await this.firebaseFunctions.function('notification').function('register').call({
            teamId: teamId,
            personId: personId,
            token: token
        });
        const messageSubject = new Subject<NotificationPayload>();
        onMessage(this.messaging, {
            next: payload => {
                if (payload.notification !== undefined)
                    messageSubject.next(payload.notification);
            },
            error: error => messageSubject.error(error),
            complete: () => messageSubject.complete()
        });
        return messageSubject;
    }

    public async subscribe(teamId: TeamId, personId: PersonId, ...subscriptions: NotificationSubscription[]) {
        await this.firebaseFunctions.function('notification').function('subscribe').call({
            teamId: teamId,
            personId: personId,
            subscriptions: subscriptions
        });
    }
}
