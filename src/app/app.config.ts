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

const emulatorPorts = {
    auth: 9099,
    firestore: 8080,
    functions: 5001
};

const emulatorHost =
    typeof globalThis !== 'undefined' && typeof globalThis.location !== 'undefined'
        ? globalThis.location.hostname
        : 'localhost';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),

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
                connectAuthEmulator(auth, `http://${emulatorHost}:${emulatorPorts.auth}`, { disableWarnings: true });
            return auth;
        }),
        provideFirestore(() => {
            const firestore = getFirestore();
            if (!isProduction)
                connectFirestoreEmulator(firestore, emulatorHost, emulatorPorts.firestore);
            return firestore;
        }),
        provideFunctions(() => {
            const functions = getFunctions();
            functions.region = 'europe-west1';
            if (!isProduction)
                connectFunctionsEmulator(functions, emulatorHost, emulatorPorts.functions);
            return functions;
        })
        // provideMessaging(() => getMessaging())
    ]
};
