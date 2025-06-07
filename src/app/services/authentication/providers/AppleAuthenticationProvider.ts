import { Auth, OAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { IAuthenticationProvider } from './IAuthenticationProvider';

export class AppleAuthenticationProvider implements IAuthenticationProvider {

    public async signIn(auth: Auth): Promise<UserCredential> {
        const provider = new OAuthProvider('apple.com');
        return await signInWithPopup(auth, provider);
    }
}
