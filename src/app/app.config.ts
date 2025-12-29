import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Provide routes with the defined routes
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Provide PrimeNG configuration
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'

// Provide Firebase configuration
import { firebaseConfig, isProduction } from '../environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { browserLocalPersistence, connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions';
// import { getMessaging, provideMessaging } from '@angular/fire/messaging';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideAnimationsAsync(), // TODO: Remove

        // Provide the router with the defined routes
        provideRouter(routes),

        // Provide PrimeNG configuration
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: false
                }
            },
            ripple: true
        }),

        // Provide Firebase configuration
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideAuth(() => {
            const auth = getAuth();
            auth.setPersistence(browserLocalPersistence);
            if (!isProduction)
                connectAuthEmulator(auth, 'http://192.168.178.47:9099', { disableWarnings: true });
            return auth;
        }),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (!isProduction)
                connectFirestoreEmulator(firestore, '192.168.178.47', 8080);
            return firestore;
        }),
        provideFunctions(() => {
            const functions = getFunctions();
            functions.region = 'europe-west1';
            if (!isProduction)
                connectFunctionsEmulator(functions, '192.168.178.47', 5001);
            return functions;
        })
        // provideMessaging(() => getMessaging())
    ]
};
