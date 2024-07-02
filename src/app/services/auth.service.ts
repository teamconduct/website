import { inject, Injectable } from '@angular/core';
import { Auth, AuthErrorCodes, createUserWithEmailAndPassword, GoogleAuthProvider as FirebaseGoogleAuthProvider, OAuthProvider as FirebaseOAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential } from '@angular/fire/auth';

export interface IAuthProvider {
    signIn(auth: Auth): Promise<UserCredential>
}

export class EmailAuthProvider implements IAuthProvider {

    public constructor(
        private readonly email: string,
        private readonly password: string
    ) {}

    private async createUserWithEmailAndPassword(auth: Auth): Promise<UserCredential> {
        return await createUserWithEmailAndPassword(auth, this.email, this.password);
    }

    private async signInWithEmail(auth: Auth): Promise<UserCredential> {
        return await signInWithEmailAndPassword(auth, this.email, this.password);
    }

    public async signIn(auth: Auth): Promise<UserCredential> {
        try {
            return await this.signInWithEmail(auth);
        } catch (error) {
            if (typeof error === 'object' && error !== null &&'code' in error && error.code === AuthErrorCodes.USER_DELETED)
                return await this.createUserWithEmailAndPassword(auth);
            throw error;
        }

    }
}

export class GoogleAuthProvider implements IAuthProvider {

    public async signIn(auth: Auth): Promise<UserCredential> {
        const provider = new FirebaseGoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    }
}

export class AppleAuthProvider implements IAuthProvider {

    public async signIn(auth: Auth): Promise<UserCredential> {
        const provider = new FirebaseOAuthProvider('apple.com');
        return await signInWithPopup(auth, provider);
    }
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private firebaseAuth = inject(Auth);

    public async signIn(provider: IAuthProvider): Promise<UserCredential> {
        return await provider.signIn(this.firebaseAuth);
    }

    public async signOut() {
        await signOut(this.firebaseAuth);
    }
}
