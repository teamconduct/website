import { inject, Injectable } from '@angular/core';
import { FirebaseFunctionsService } from './firebase-functions.service';
import { UserManagerService } from './user-manager.service';
import { PersonId } from '../types';
import { NotificationSubscription } from '../types/PersonNotificationProperties';
import { getToken, Messaging, NotificationPayload, onMessage } from '@angular/fire/messaging';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private userManager = inject(UserManagerService);

    private messaging = inject(Messaging);

    private firebaseFunctions = inject(FirebaseFunctionsService);

    private get signedInPersonId(): PersonId | null {
        if (this.userManager.signedInUser === null || this.userManager.currentTeamId === null)
            return null;
        if (!this.userManager.signedInUser.teams.has(this.userManager.currentTeamId))
            return null;
        return this.userManager.signedInUser.teams.get(this.userManager.currentTeamId).personId;
    }

    private async requestPermission(): Promise<string | null> {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted')
            return null;
        const registration = await navigator.serviceWorker.register('/assets/firebase-messaging-sw.js', { type: 'module' });
        return await getToken(this.messaging, { serviceWorkerRegistration: registration });
    }

    public async register(): Promise<Subject<NotificationPayload> | null> {
        if (this.signedInPersonId === null || this.userManager.currentTeamId === null)
            return null;
        const token = await this.requestPermission();
        if (token === null)
            return null;
        await this.firebaseFunctions.function('notification').function('register').call({
            teamId: this.userManager.currentTeamId,
            personId: this.signedInPersonId,
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

    public async subscribe(...subscriptions: NotificationSubscription[]) {
        if (this.signedInPersonId === null || this.userManager.currentTeamId === null)
            return;
        await this.firebaseFunctions.function('notification').function('subscribe').call({
            teamId: this.userManager.currentTeamId,
            personId: this.signedInPersonId,
            subscriptions: subscriptions
        });
    }
}
