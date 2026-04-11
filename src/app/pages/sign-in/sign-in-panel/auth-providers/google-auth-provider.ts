import { AuthProvider, ThirdPartyError } from '../../types';
import { GoogleSignInProvider } from '../../../../services/sign-in/providers';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { IAuthMethodProvider } from './i-auth-method-provider';

/**
 * Google authentication provider
 */
export class GoogleAuthProvider extends IAuthMethodProvider<ThirdPartyError> {
    get providerType(): AuthProvider {
        return 'google';
    }

    get errorMessage(): string | null {
        if (this.error === null) {
            return null;
        }

        if (this.error === 'internal-error') {
            return $localize`:Google sign-in internal error@@googleInternalError:An internal error occurred with Google sign in. Please try again later.`;
        }

        return $localize`:Google sign-in popup closed error@@googlePopupClosed:Google sign in was cancelled. Please try again.`;
    }

    async authenticate(): Promise<Result<void, 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'>> {
        const signInProvider = new GoogleSignInProvider();
        return await this.signInService.auth(signInProvider);
    }

    /**
     * Maps authentication errors to third-party error types
     */
    mapAuthError(error: 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'): ThirdPartyError {
        return (error === 'popup-cancelled' || error === 'popup-blocked') ? 'popup-closed' : 'internal-error';
    }
}
