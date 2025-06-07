import { AppleAuthenticationProvider } from '../../authentication/providers';
import { ISignInProvider, SignInErrorCode } from './ISignInProvider';

export class AppleSignInProvider implements ISignInProvider<'validation-failed' | 'popup-canceled' | 'popup-blocked' | 'unknown'> {

    public type = 'apple';

    public error: 'validation-failed' | 'popup-canceled' | 'popup-blocked' | 'unknown' | { message: string } | null = null;

    public checkValidation(): boolean {
        return true;
    }

    public getAuthProvider(): AppleAuthenticationProvider {
        return new AppleAuthenticationProvider();
    }

    public cleanup() {}

    public handleAuthError(code: SignInErrorCode | null) {
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request')
            this.error = 'popup-canceled';
        else if (code === 'auth/popup-blocked')
            this.error = 'popup-blocked';
        else
            this.error = 'unknown';
    }
}
