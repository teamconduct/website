import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { IAuthenticationProvider } from './IAuthenticationProvider';

export class GoogleAuthenticationProvider implements IAuthenticationProvider {

    public async signIn(auth: Auth): Promise<UserCredential> {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
    }
}
