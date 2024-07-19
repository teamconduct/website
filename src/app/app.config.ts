import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, connectAuthEmulator, browserSessionPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideFunctions, getFunctions, connectFunctionsEmulator } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

import { routes } from './app.routes';
import { firebaseConfig, isProduction } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({
            eventCoalescing: true
        }),
        provideAnimations(),
        provideRouter(routes),
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideAuth(() => {
            const auth = getAuth();
            void auth.setPersistence(isProduction ? browserSessionPersistence : browserLocalPersistence);
            if (!isProduction)
                connectAuthEmulator(auth, 'http://localhost:9099');
            return auth;
        }),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (!isProduction)
                connectFirestoreEmulator(firestore, 'localhost', 8080);
            return firestore;

        }),
        provideFunctions(() => {
            const functions = getFunctions();
            functions.region = 'europe-west1';
            if (!isProduction)
                connectFunctionsEmulator(functions, 'localhost', 5001);
            return functions;
        }),
        provideMessaging(() => getMessaging())
    ]
};
