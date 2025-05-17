import { inject, Injectable } from '@angular/core';
import { FirebaseFunctionsService } from './firebase-functions.service';
import { NotificationProperties, Team, Person } from '@stevenkellner/team-conduct-api';
import { getToken, Messaging, NotificationPayload, onMessage } from '@angular/fire/messaging';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private messaging = inject(Messaging);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private async requestPermission(): Promise<string | null> {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted')
            return null;
        const registration = await navigator.serviceWorker.register('/assets/firebase-messaging-sw.js', { type: 'module' });
        return await getToken(this.messaging, { serviceWorkerRegistration: registration });
    }

    public async register(teamId: Team.Id, personId: Person.Id): Promise<Subject<NotificationPayload> | null> {
        const token = await this.requestPermission();
        if (token === null)
            return null;
        await this.firebaseFunctions.functions.notification.register.execute({
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

    public async subscribe(teamId: Team.Id, personId: Person.Id, ...subscriptions: NotificationProperties.Subscription[]) {
        await this.firebaseFunctions.functions.notification.subscribe.execute({
            teamId: teamId,
            personId: personId,
            subscriptions: subscriptions
        });
    }
}
