import { AuthProvider, ThirdPartyError } from '../../types';
import { AppleSignInProvider } from '../../../../services/sign-in/providers';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { IAuthMethodProvider } from './i-auth-method-provider';

/**
 * Apple authentication provider
 */
export class AppleAuthProvider extends IAuthMethodProvider<ThirdPartyError> {
    get providerType(): AuthProvider {
        return 'apple';
    }

    get errorMessage(): string | null {
        if (this.error === null) {
            return null;
        }

        if (this.error === 'internal-error') {
            return $localize`:Apple sign-in internal error@@appleInternalError:An internal error occurred with Apple sign in. Please try again later.`;
        }

        return $localize`:Apple sign-in popup closed error@@applePopupClosed:Apple sign in was cancelled. Please try again.`;
    }

    async authenticate(): Promise<Result<void, 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'>> {
        const signInProvider = new AppleSignInProvider();
        return await this.signInService.auth(signInProvider);
    }

    /**
     * Maps authentication errors to third-party error types
     */
    mapAuthError(error: 'popup-cancelled' | 'popup-blocked' | 'wrong-password' | 'unknown'): ThirdPartyError {
        return (error === 'popup-cancelled' || error === 'popup-blocked') ? 'popup-closed' : 'internal-error';
    }
}
