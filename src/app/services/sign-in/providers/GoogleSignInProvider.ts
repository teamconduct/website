import { GoogleAuthenticationProvider } from '../../authentication/providers';
import { ISignInProvider, SignInErrorCode } from './ISignInProvider';

export class GoogleSignInProvider implements ISignInProvider<'popup-cancelled' | 'popup-blocked' | 'unknown'> {

    public getAuthProvider(): GoogleAuthenticationProvider {
        return new GoogleAuthenticationProvider();
    }
    public handleAuthError(code: SignInErrorCode | null): 'popup-cancelled' | 'popup-blocked' | 'unknown' | null {
        if (code === null)
            return null;
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
            return 'popup-cancelled';
        if (code === 'auth/popup-blocked')
            return 'popup-blocked';
        return 'unknown';
    }
}
