import { inject, Injectable } from '@angular/core';
import { Auth, signOut, UserCredential } from '@angular/fire/auth';
import { IAuthenticationProvider } from './providers/IAuthenticationProvider';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    private firebaseAuth = inject(Auth);

    public async signIn(provider: IAuthenticationProvider): Promise<UserCredential> {
        return await provider.signIn(this.firebaseAuth);
    }

    public async signOut() {
        await signOut(this.firebaseAuth);
    }
}
