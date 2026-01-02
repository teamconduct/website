import { AppleAuthenticationProvider } from '../../authentication/providers';
import { ISignInProvider, SignInErrorCode } from './ISignInProvider';

export class AppleSignInProvider implements ISignInProvider<'popup-cancelled' | 'popup-blocked' | 'unknown'> {

    public getAuthProvider(): AppleAuthenticationProvider {
        return new AppleAuthenticationProvider();
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
